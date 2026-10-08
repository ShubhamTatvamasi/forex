import { CURRENCY_SYMBOLS, FULL_VALUE_CURRENCIES, type Currency, type PurposeKind } from './purposes';

export const COMMISSION_LOW = 500; // INR, for remittances up to USD 500 or equivalent
export const COMMISSION_HIGH = 1000; // INR, above that
/** Indicative USD/INR rate used only to translate the "USD 500 or equivalent" slab boundary into INR. */
export const INDICATIVE_USD_INR = 96.3;
export const COMMISSION_SLAB_BOUNDARY_INR = 500 * INDICATIVE_USD_INR;
export const CGST_RATE = 0.09;
export const SGST_RATE = 0.09;

export const LRS_TCS_THRESHOLD = 1_000_000; // ₹10,00,000 per financial year
export const LRS_ANNUAL_LIMIT_USD = 250_000; // USD 2,50,000 per financial year, hard LRS cap

export type PanStatus = 'operative' | 'inoperative';
export type CorrespondentCharge = 'self' | 'beneficiary' | 'full_value';

export interface CalcInput {
  fcyAmount: number;
  currency: Currency;
  baseRate: number;
  markupPerUnit: number;
  purposeKind: PurposeKind;
  panStatus: PanStatus;
  priorLrs: number;
  correspondentCharge: CorrespondentCharge;
  credAmountPaid: number;
}

export interface GstSlab {
  rateLabel: string;
  minGst: number;
  maxGst: number;
}

export interface CalcResult {
  fcyAmount: number;
  currency: Currency;
  effectiveRate: number;
  ace: number;
  commission: number;
  cgstOnCommission: number;
  sgstOnCommission: number;
  totalCommissionCharges: number;
  supplyValue: number;
  cgstOnAce: number;
  sgstOnAce: number;
  totalGstOnAce: number;
  gstRateLabel: string;
  gstMin: number;
  gstMax: number;
  effectiveGstPct: number;
  taxableForTcs: number;
  tcsRatePct: number;
  tcs: number;
  totalCharges: number;
  totalPayable: number;
  cumulativeAfter: number;
  cumulativeAfterUsd: number;
  lrsUsdRemaining: number;
  commissionSlabGapUsd: number | null;
  credAmountPaid: number;
  credCashback: number;
  fullValueEligible: boolean;
}

/**
 * Standard "round half up" to 2 decimals, avoiding floating-point quirks where
 * e.g. 43.425 is stored as 43.42499999... and rounds down instead of up.
 */
export function roundHalfUp2(amount: number): number {
  return Math.round(amount * 100 + 1e-9) / 100;
}

/** GST "value of supply" slabs under CGST Rule 32(2)(b). */
export function valueOfSupply(ace: number): number {
  if (ace <= 100_000) return Math.max(0.01 * ace, 250);
  if (ace <= 1_000_000) return 1000 + 0.005 * (ace - 100_000);
  return Math.min(5500 + 0.001 * (ace - 1_000_000), 60_000);
}

/** The GST slab expressed the way the HDFC RemitNow page presents it. */
export function gstSlab(ace: number): GstSlab {
  if (ace <= 100_000) return { rateLabel: '0.18% of ACE', minGst: 45, maxGst: 180 };
  if (ace <= 1_000_000) return { rateLabel: '₹180 + 0.09% of ACE', minGst: 180, maxGst: 990 };
  return { rateLabel: '₹990 + 0.018% of ACE', minGst: 990, maxGst: 10_800 };
}

export function tcsRate(kind: PurposeKind, panStatus: PanStatus, amountAboveThreshold: number): number {
  if (amountAboveThreshold <= 0) return 0;
  if (kind === 'education_loan') return 0;
  if (kind === 'education_medical') return panStatus === 'inoperative' ? 0.05 : 0.02;
  return 0.2;
}

export function calculate(input: CalcInput): CalcResult {
  const { fcyAmount, currency, baseRate, markupPerUnit, purposeKind, panStatus, credAmountPaid } = input;
  const priorLrs = input.priorLrs;

  const effectiveRate = baseRate + markupPerUnit;
  const ace = fcyAmount * effectiveRate;

  // RemitNow's commission slab boundary is "USD 500 or equivalent". For a USD
  // remittance we compare the FCY amount directly; for any other currency we
  // compare the ACE (INR value) against the INR equivalent of USD 500.
  const commission =
    (currency === 'USD' ? fcyAmount <= 500 : ace <= COMMISSION_SLAB_BOUNDARY_INR) ? COMMISSION_LOW : COMMISSION_HIGH;

  const cgstOnCommission = commission * CGST_RATE;
  const sgstOnCommission = commission * SGST_RATE;
  const totalCommissionCharges =
    roundHalfUp2(commission) + roundHalfUp2(cgstOnCommission) + roundHalfUp2(sgstOnCommission);

  const supplyValue = valueOfSupply(ace);
  const cgstOnAce = supplyValue * CGST_RATE;
  const sgstOnAce = supplyValue * SGST_RATE;
  const totalGstOnAce = roundHalfUp2(cgstOnAce) + roundHalfUp2(sgstOnAce);
  const slab = gstSlab(ace);
  const effectiveGstPct = ace > 0 ? (totalGstOnAce / ace) * 100 : 0;

  const cumulativeAfter = priorLrs + ace;
  const alreadyOverThreshold = priorLrs >= LRS_TCS_THRESHOLD;
  const taxableForTcs = alreadyOverThreshold ? ace : Math.max(0, cumulativeAfter - LRS_TCS_THRESHOLD);

  const rate = tcsRate(purposeKind, panStatus, taxableForTcs);
  const tcs = taxableForTcs * rate;

  const cumulativeAfterUsd = cumulativeAfter / INDICATIVE_USD_INR;
  const lrsUsdRemaining = LRS_ANNUAL_LIMIT_USD - cumulativeAfterUsd;

  const commissionSlabGapUsd = currency === 'USD' && fcyAmount > 500 ? fcyAmount - 500 : null;

  const totalCharges =
    roundHalfUp2(commission) +
    roundHalfUp2(cgstOnCommission) +
    roundHalfUp2(sgstOnCommission) +
    roundHalfUp2(cgstOnAce) +
    roundHalfUp2(sgstOnAce) +
    roundHalfUp2(tcs);
  const totalPayable = roundHalfUp2(ace) + totalCharges;

  const credCashback = credAmountPaid > 0 ? Math.max(0, credAmountPaid - roundHalfUp2(ace)) : 0;

  return {
    fcyAmount,
    currency,
    effectiveRate,
    ace,
    commission,
    cgstOnCommission,
    sgstOnCommission,
    totalCommissionCharges,
    supplyValue,
    cgstOnAce,
    sgstOnAce,
    totalGstOnAce,
    gstRateLabel: slab.rateLabel,
    gstMin: slab.minGst,
    gstMax: slab.maxGst,
    effectiveGstPct,
    taxableForTcs,
    tcsRatePct: rate * 100,
    tcs,
    totalCharges,
    totalPayable,
    cumulativeAfter,
    cumulativeAfterUsd,
    lrsUsdRemaining,
    commissionSlabGapUsd,
    credAmountPaid,
    credCashback,
    fullValueEligible: FULL_VALUE_CURRENCIES.includes(currency),
  };
}

export const CORRESPONDENT_CHARGE_HINTS: Record<CorrespondentCharge, string> = {
  self: 'Correspondent bank charges will be borne by you and applied separately, post successful processing of the transaction — not included in the totals below.',
  beneficiary:
    'Correspondent bank charges will be borne by the beneficiary and deducted from the remittance amount sent — they will receive less than the amount shown below.',
  full_value: 'No correspondent bank charges are levied when this option is chosen.',
};

export function currencySymbol(c: Currency): string {
  return CURRENCY_SYMBOLS[c];
}
