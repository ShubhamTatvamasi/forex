import { calculate, type CalcResult, type CorrespondentCharge, type PanStatus } from '../lib/calc/engine';
import { CURRENCIES, DEFAULT_PURPOSE_ID, findPurpose, type Currency } from '../lib/calc/purposes';

export interface FormState {
  fcyAmount: number;
  currency: Currency;
  baseRate: number;
  markupPerUnit: number;
  purposeId: string;
  panStatus: PanStatus;
  priorLrs: number;
  priorLrsOverThreshold: boolean;
  correspondentCharge: CorrespondentCharge;
  credAmountPaid: number;
}

export const DEFAULT_FORM: FormState = {
  fcyAmount: 500,
  currency: 'USD',
  baseRate: 96.3,
  markupPerUnit: 0.2,
  purposeId: DEFAULT_PURPOSE_ID,
  panStatus: 'operative',
  priorLrs: 0,
  priorLrsOverThreshold: false,
  correspondentCharge: 'full_value',
  credAmountPaid: 48_320,
};

class CalculatorState {
  form = $state<FormState>({ ...DEFAULT_FORM });

  /** The prior-LRS figure actually used: the toggle forces it to the threshold. */
  effectivePriorLrs = $derived(
    this.form.priorLrsOverThreshold ? Math.max(1_000_000, this.form.priorLrs) : this.form.priorLrs,
  );

  purpose = $derived(findPurpose(this.form.purposeId));

  result = $derived<CalcResult>(
    calculate({
      fcyAmount: this.form.fcyAmount,
      currency: this.form.currency,
      baseRate: this.form.baseRate,
      markupPerUnit: this.form.markupPerUnit,
      purposeKind: this.purpose.kind,
      panStatus: this.form.panStatus,
      priorLrs: this.effectivePriorLrs,
      correspondentCharge: this.form.correspondentCharge,
      credAmountPaid: this.form.credAmountPaid,
    }),
  );

  /** PAN status only affects the TCS rate for education (self-funded) / medical treatment. */
  showPanStatus = $derived(this.purpose.kind === 'education_medical');

  set<K extends keyof FormState>(key: K, value: FormState[K]) {
    this.form[key] = value;
  }

  reset() {
    this.form = { ...DEFAULT_FORM };
  }
}

export const app = new CalculatorState();
export { CURRENCIES };
