// RemitNow-style forex charge calculator
// Methodology notes are documented in index.html "How this is calculated" section.

const CURRENCIES = [
  "USD", "GBP", "EUR", "AUD", "CAD", "SGD", "AED", "JPY", "CHF", "NZD"
];

const CURRENCY_SYMBOLS = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  AUD: "$",
  CAD: "$",
  SGD: "$",
  AED: "د.إ",
  JPY: "¥",
  CHF: "Fr",
  NZD: "$",
};

const COMMISSION_LOW = 500;   // INR, for remittances up to USD 500 or equivalent
const COMMISSION_HIGH = 1000; // INR, above that
// Indicative USD/INR rate used only to translate the "USD 500 or equivalent"
// commission slab boundary into INR when the user is remitting in a
// non-USD currency. This does not affect the ACE or any other calculation.
const INDICATIVE_USD_INR = 96.3;
const COMMISSION_SLAB_BOUNDARY_INR = 500 * INDICATIVE_USD_INR;
const CGST_RATE = 0.09;
const SGST_RATE = 0.09;

const LRS_TCS_THRESHOLD = 1000000; // Rs 10,00,000 per financial year
const LRS_ANNUAL_LIMIT_USD = 250000; // USD 2,50,000 per financial year, hard LRS cap

// Full Value is available for remittances in these currencies, to any
// destination, for all personal purposes offered under RemitNow.
const FULL_VALUE_CURRENCIES = ["USD", "EUR", "GBP"];

const CORRESPONDENT_CHARGE_HINTS = {
  self: "Correspondent bank charges will be borne by you and applied separately, post successful processing of the transaction — not included in the totals below.",
  beneficiary: "Correspondent bank charges will be borne by the beneficiary and deducted from the remittance amount sent — they will receive less than the amount shown below.",
  full_value: "No correspondent bank charges are levied when this option is chosen.",
};

function populateCurrencies() {
  const select = document.getElementById("currency");
  select.innerHTML = CURRENCIES
    .map((c) => `<option value="${c}">${c} (${CURRENCY_SYMBOLS[c]})</option>`)
    .join("");
}

// Standard "round half up" to 2 decimals, avoiding floating-point quirks
// where e.g. 43.425 is stored as 43.42499999... and rounds down instead of up.
// The tiny fixed nudge pushes true .xx5 boundary values over before rounding,
// without affecting any value that isn't already essentially at that boundary.
function roundHalfUp2(amount) {
  return Math.round(amount * 100 + 1e-9) / 100;
}

function formatINR(amount) {
  return roundHalfUp2(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

// GST "value of supply" slabs under CGST Rule 32(2)(b)
function valueOfSupply(ace) {
  if (ace <= 100000) {
    return Math.max(0.01 * ace, 250);
  }
  if (ace <= 1000000) {
    return 1000 + 0.005 * (ace - 100000);
  }
  const uncapped = 5500 + 0.001 * (ace - 1000000);
  return Math.min(uncapped, 60000);
}

// The GST slab that applies to a given ACE, expressed the way the HDFC
// RemitNow page presents it: total GST (CGST + SGST = 18% of value of supply)
// as a percentage of the amount exchanged, with the published min/max caps.
// 0.18% = 18% x 1%, 0.09% = 18% x 0.5%, 0.018% = 18% x 0.1%.
function gstSlab(ace) {
  if (ace <= 100000) {
    return { rateLabel: "0.18% of ACE", minGst: 45, maxGst: 180 };
  }
  if (ace <= 1000000) {
    return { rateLabel: "₹180 + 0.09% of ACE", minGst: 180, maxGst: 990 };
  }
  return { rateLabel: "₹990 + 0.018% of ACE", minGst: 990, maxGst: 10800 };
}

function tcsRate(purpose, panStatus, amountAboveThreshold) {
  if (amountAboveThreshold <= 0) return 0;
  if (purpose === "education_loan") return 0;
  if (purpose === "education_medical") return panStatus === "inoperative" ? 0.05 : 0.02;
  // "other"
  return 0.2;
}

function calculate() {
  const fcyAmount = parseFloat(document.getElementById("fcyAmount").value) || 0;
  const currency = document.getElementById("currency").value;
  const baseRate = parseFloat(document.getElementById("baseRate").value) || 0;
  const markupPerUnit = parseFloat(document.getElementById("markup").value) || 0;
  const purpose = document.getElementById("purpose").value;
  const panStatus = document.getElementById("panStatus").value;
  const priorLrsOverThreshold = document.getElementById("priorLrsOverThreshold").checked;
  const priorLrs = priorLrsOverThreshold
    ? Math.max(LRS_TCS_THRESHOLD, parseFloat(document.getElementById("priorLrs").value) || 0)
    : parseFloat(document.getElementById("priorLrs").value) || 0;
  const correspondentCharge = document.getElementById("correspondentCharge").value;

  const fullValueEligible = FULL_VALUE_CURRENCIES.includes(currency);

  const correspondentChargeHint = document.getElementById("correspondentChargeHint");
  correspondentChargeHint.textContent =
    correspondentCharge === "full_value" && !fullValueEligible
      ? `Full Value is only available for remittances in ${FULL_VALUE_CURRENCIES.join(", ")} — select one of those currencies, or choose Self / Beneficiary instead.`
      : CORRESPONDENT_CHARGE_HINTS[correspondentCharge];

  const fullValueRecommendation = document.getElementById("fullValueRecommendation");
  if (fullValueEligible && correspondentCharge !== "full_value") {
    fullValueRecommendation.textContent =
      "Recommended: switch to Full Value — it's available for this currency and guarantees zero correspondent bank charges, for you or the beneficiary, at no extra cost.";
    fullValueRecommendation.hidden = false;
  } else {
    fullValueRecommendation.hidden = true;
  }

  const effectiveRate = baseRate + markupPerUnit;
  const ace = fcyAmount * effectiveRate;

  // RemitNow's commission slab boundary is "USD 500 or equivalent". For a USD
  // remittance we compare the FCY amount directly; for any other currency we
  // compare the ACE (INR value) against the INR equivalent of USD 500.
  const commission =
    (currency === "USD" ? fcyAmount <= 500 : ace <= COMMISSION_SLAB_BOUNDARY_INR)
      ? COMMISSION_LOW
      : COMMISSION_HIGH;

  const cgstOnCommission = commission * CGST_RATE;
  const sgstOnCommission = commission * SGST_RATE;
  // Sum the rounded components (not the raw values) so this matches what the
  // individual rows display and what totalCharges actually adds up.
  const totalCommissionCharges =
    roundHalfUp2(commission) + roundHalfUp2(cgstOnCommission) + roundHalfUp2(sgstOnCommission);

  const supplyValue = valueOfSupply(ace);
  const cgstOnAce = supplyValue * CGST_RATE;
  const sgstOnAce = supplyValue * SGST_RATE;
  // Sum the rounded CGST/SGST (not the raw values) so this matches what the
  // individual rows display and what totalCharges actually adds up.
  const totalGstOnAce = roundHalfUp2(cgstOnAce) + roundHalfUp2(sgstOnAce);
  const slab = gstSlab(ace);
  // Effective GST as a % of the amount exchanged, matching how the HDFC page
  // expresses its slab rates.
  const effectiveGstPct = ace > 0 ? (totalGstOnAce / ace) * 100 : 0;

  const cumulativeBefore = priorLrs;
  const cumulativeAfter = priorLrs + ace;
  const amountAboveThreshold = Math.max(0, cumulativeAfter - Math.max(cumulativeBefore, LRS_TCS_THRESHOLD));
  const alreadyOverThreshold = cumulativeBefore >= LRS_TCS_THRESHOLD;
  const taxableForTcs = alreadyOverThreshold
    ? ace
    : Math.max(0, cumulativeAfter - LRS_TCS_THRESHOLD);

  document.getElementById("panStatusField").hidden = purpose !== "education_medical";

  const rate = tcsRate(purpose, panStatus, taxableForTcs);
  const tcs = taxableForTcs * rate;

  // LRS annual cap is denominated in USD; convert the cumulative INR total
  // using the indicative USD/INR rate so it can be compared against it.
  const cumulativeAfterUsd = cumulativeAfter / INDICATIVE_USD_INR;
  const lrsUsdRemaining = LRS_ANNUAL_LIMIT_USD - cumulativeAfterUsd;

  // Commission slab nudge: only meaningful for a USD remittance sitting just
  // above the $500 boundary, where a small reduction would halve the commission.
  const commissionSlabGapUsd =
    currency === "USD" && fcyAmount > 500 ? fcyAmount - 500 : null;

  // Sum the rounded line items (not the raw pre-rounding values) so the
  // displayed subtotal matches what the individual rows actually show.
  const totalCharges =
    roundHalfUp2(commission) +
    roundHalfUp2(cgstOnCommission) +
    roundHalfUp2(sgstOnCommission) +
    roundHalfUp2(cgstOnAce) +
    roundHalfUp2(sgstOnAce) +
    roundHalfUp2(tcs);
  const totalPayable = roundHalfUp2(ace) + totalCharges;

  renderResult({
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
    purpose,
    cumulativeAfterUsd,
    lrsUsdRemaining,
    commissionSlabGapUsd,
  });
}

function row(label, value, opts = {}) {
  const cls = [];
  if (opts.subtotal) cls.push("subtotal");
  if (opts.tcs) cls.push("tcs-row");
  if (opts.section) cls.push("section-label");
  if (opts.note) cls.push("note-row");
  const classAttr = cls.length ? ` class="${cls.join(" ")}"` : "";
  const valueCell = opts.section ? "" : `<td>${value}</td>`;
  return `<tr${classAttr}><td>${label}</td>${valueCell}</tr>`;
}

function renderResult(r) {
  document.getElementById("aceValue").textContent = formatINR(r.ace);
  document.getElementById("totalValue").textContent = formatINR(r.totalPayable);
  document.getElementById("chargesValue").textContent = formatINR(r.totalCharges);

  const rows = [
    row("Effective exchange rate", `1 ${r.currency} (${CURRENCY_SYMBOLS[r.currency]}) = ₹${r.effectiveRate.toFixed(4)}`),
    row(`Amount of Currency Exchanged (${CURRENCY_SYMBOLS[r.currency]}${r.fcyAmount} ${r.currency})`, formatINR(r.ace)),

    row("Fees & Commission", "", { section: true }),
    row("RemitNow commission", formatINR(r.commission)),
    row("CGST on commission (9%)", formatINR(r.cgstOnCommission)),
    row("SGST on commission (9%)", formatINR(r.sgstOnCommission)),
    row("Total Fees & Commission", formatINR(r.totalCommissionCharges), { subtotal: true }),

    row("GST on Amount of Currency Exchanged", "", { section: true }),
    row(`Applicable GST slab: ${r.gstRateLabel} (min ₹${r.gstMin}, max ₹${r.gstMax.toLocaleString("en-IN")})`, "", { note: true }),
    row("Value of supply (tax base only — not a charge)", formatINR(r.supplyValue), { note: true }),
    row("CGST on value of supply (9%)", formatINR(r.cgstOnAce)),
    row("SGST on value of supply (9%)", formatINR(r.sgstOnAce)),
    row(`Total GST on ACE (effective ${r.effectiveGstPct.toFixed(3)}% of ACE)`, formatINR(r.totalGstOnAce), { subtotal: true }),

    row("Tax Collected at Source", "", { section: true }),
    row(
      `TCS @ ${r.tcsRatePct.toFixed(0)}% on ${formatINR(r.taxableForTcs)}`,
      formatINR(r.tcs),
      { tcs: true }
    ),

    row("Total charges (commission + GST + TCS)", formatINR(r.totalCharges), { subtotal: true }),
    row("Total amount payable", formatINR(r.totalPayable), { subtotal: true }),
  ];

  document.getElementById("breakdownBody").innerHTML = rows.join("");

  const note = document.getElementById("thresholdNote");
  if (r.cumulativeAfter > LRS_TCS_THRESHOLD) {
    note.textContent = `Cumulative LRS remittances this financial year (including this transaction) reach ${formatINR(r.cumulativeAfter)}, which is above the ₹10,00,000 TCS threshold. TCS is recoverable — you can claim it as a credit against your income tax liability, or as a refund when filing your return.`;
  } else {
    const headroom = LRS_TCS_THRESHOLD - r.cumulativeAfter;
    note.textContent = `Cumulative LRS remittances this financial year (including this transaction) total ${formatINR(r.cumulativeAfter)}, within the ₹10,00,000 threshold, so no TCS applies yet. Headroom remaining this FY: ${formatINR(headroom)} — any further LRS remittance this financial year above that amount will trigger TCS on the excess (informational only, not tax advice).`;
  }

  const lrsLimitNote = document.getElementById("lrsLimitNote");
  if (r.cumulativeAfterUsd > LRS_ANNUAL_LIMIT_USD) {
    lrsLimitNote.textContent = `This transaction takes your FY LRS total to an estimated $${r.cumulativeAfterUsd.toFixed(0)} — above the USD ${LRS_ANNUAL_LIMIT_USD.toLocaleString("en-US")} Liberalised Remittance Scheme annual cap. This is a hard regulatory limit (not just a tax threshold); remittances beyond it are not permitted this financial year without RBI approval.`;
    lrsLimitNote.hidden = false;
  } else if (r.lrsUsdRemaining <= 20000) {
    lrsLimitNote.textContent = `Approaching the LRS annual cap: an estimated $${r.lrsUsdRemaining.toFixed(0)} of headroom remains out of USD ${LRS_ANNUAL_LIMIT_USD.toLocaleString("en-US")} for this financial year (based on the indicative USD/INR rate).`;
    lrsLimitNote.hidden = false;
  } else {
    lrsLimitNote.hidden = true;
  }

  const commissionSlabNote = document.getElementById("commissionSlabNote");
  if (r.commissionSlabGapUsd !== null && r.commissionSlabGapUsd <= 25) {
    commissionSlabNote.textContent = `You're $${r.commissionSlabGapUsd.toFixed(2)} above the $500 commission slab boundary, where commission jumps from ₹500 to ₹1,000. If you have flexibility in the amount, remitting $500 or less would halve the commission.`;
    commissionSlabNote.hidden = false;
  } else {
    commissionSlabNote.hidden = true;
  }

  document.getElementById("resultCard").hidden = false;
}

const INPUT_IDS = [
  "fcyAmount",
  "currency",
  "baseRate",
  "markup",
  "purpose",
  "panStatus",
  "priorLrs",
  "correspondentCharge",
];

const STEPPER_DECIMALS = {
  fcyAmount: 2,
  baseRate: 2,
  markup: 2,
  priorLrs: 0,
};

document.addEventListener("DOMContentLoaded", () => {
  populateCurrencies();
  INPUT_IDS.forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("input", calculate);
    el.addEventListener("change", calculate);
  });

  const priorLrsInput = document.getElementById("priorLrs");
  const priorLrsOverThreshold = document.getElementById("priorLrsOverThreshold");
  const setPriorLrsDisabled = (disabled) => {
    priorLrsInput.disabled = disabled;
    document
      .querySelectorAll('.stepper-btn[data-step-target="priorLrs"]')
      .forEach((btn) => (btn.disabled = disabled));
  };
  let priorLrsBeforeTick = priorLrsInput.value;
  priorLrsOverThreshold.addEventListener("change", () => {
    const checked = priorLrsOverThreshold.checked;
    if (checked) {
      priorLrsBeforeTick = priorLrsInput.value;
      priorLrsInput.value = LRS_TCS_THRESHOLD;
    } else {
      priorLrsInput.value = priorLrsBeforeTick;
    }
    setPriorLrsDisabled(checked);
    calculate();
  });
  Object.keys(STEPPER_DECIMALS).forEach((id) => {
    const el = document.getElementById(id);
    const decimals = STEPPER_DECIMALS[id];
    const reformat = () => {
      const value = parseFloat(el.value);
      if (!isNaN(value)) el.value = value.toFixed(decimals);
    };
    const step = (dir) => {
      const stepSize = parseFloat(el.step) || 1;
      const current = parseFloat(el.value) || 0;
      const next = dir === "up" ? current + stepSize : current - stepSize;
      const min = parseFloat(el.min);
      const clamped = !isNaN(min) && next < min ? min : next;
      el.value = clamped.toFixed(decimals);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    el.addEventListener("blur", reformat);
    el.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      step(e.key === "ArrowUp" ? "up" : "down");
    });
    document.querySelectorAll(`.stepper-btn[data-step-target="${id}"]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        el.focus();
        step(btn.dataset.stepDir);
      });
    });
    reformat();
  });
  calculate();
});
