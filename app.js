// RemitNow-style forex charge calculator
// Methodology notes are documented in index.html "How this is calculated" section.

const CURRENCIES = [
  "USD", "GBP", "EUR", "AUD", "CAD", "SGD", "AED", "JPY", "CHF", "NZD"
];

const COMMISSION_LOW = 500;   // INR, for remittances up to USD 500 or equivalent
const COMMISSION_HIGH = 1000; // INR, above that
// Indicative USD/INR rate used only to translate the "USD 500 or equivalent"
// commission slab boundary into INR when the user is remitting in a
// non-USD currency. This does not affect the ACE or any other calculation.
const INDICATIVE_USD_INR = 83.5;
const COMMISSION_SLAB_BOUNDARY_INR = 500 * INDICATIVE_USD_INR;
const CGST_RATE = 0.09;
const SGST_RATE = 0.09;

const LRS_TCS_THRESHOLD = 1000000; // Rs 10,00,000 per financial year

function populateCurrencies() {
  const select = document.getElementById("currency");
  select.innerHTML = CURRENCIES
    .map((c) => `<option value="${c}">${c}</option>`)
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

// Assumes a linked/operative PAN. If your PAN is inoperative, the
// education/medical rate rises from 2% to 5% — see the methodology note.
function tcsRate(purpose, amountAboveThreshold) {
  if (amountAboveThreshold <= 0) return 0;
  if (purpose === "education_loan") return 0;
  if (purpose === "education_medical") return 0.02;
  // "other"
  return 0.2;
}

function calculate() {
  const fcyAmount = parseFloat(document.getElementById("fcyAmount").value) || 0;
  const currency = document.getElementById("currency").value;
  const baseRate = parseFloat(document.getElementById("baseRate").value) || 0;
  const markupPerUnit = parseFloat(document.getElementById("markup").value) || 0;
  const purpose = document.getElementById("purpose").value;
  const priorLrs = parseFloat(document.getElementById("priorLrs").value) || 0;

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

  const supplyValue = valueOfSupply(ace);
  const cgstOnAce = supplyValue * CGST_RATE;
  const sgstOnAce = supplyValue * SGST_RATE;

  const cumulativeBefore = priorLrs;
  const cumulativeAfter = priorLrs + ace;
  const amountAboveThreshold = Math.max(0, cumulativeAfter - Math.max(cumulativeBefore, LRS_TCS_THRESHOLD));
  const alreadyOverThreshold = cumulativeBefore >= LRS_TCS_THRESHOLD;
  const taxableForTcs = alreadyOverThreshold
    ? ace
    : Math.max(0, cumulativeAfter - LRS_TCS_THRESHOLD);

  const rate = tcsRate(purpose, taxableForTcs);
  const tcs = taxableForTcs * rate;

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
    supplyValue,
    cgstOnAce,
    sgstOnAce,
    taxableForTcs,
    tcsRatePct: rate * 100,
    tcs,
    totalCharges,
    totalPayable,
    cumulativeAfter,
    purpose,
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

  const rows = [
    row("Effective exchange rate", `1 ${r.currency} = ₹${r.effectiveRate.toFixed(4)}`),
    row(`Amount of Currency Exchanged (${r.fcyAmount} ${r.currency})`, formatINR(r.ace)),

    row("Fees & Commission", "", { section: true }),
    row("RemitNow commission", formatINR(r.commission)),
    row("CGST on commission (9%)", formatINR(r.cgstOnCommission)),
    row("SGST on commission (9%)", formatINR(r.sgstOnCommission)),

    row("GST on Amount of Currency Exchanged", "", { section: true }),
    row("Value of supply (tax base only — not a charge)", formatINR(r.supplyValue), { note: true }),
    row("CGST on value of supply (9%)", formatINR(r.cgstOnAce)),
    row("SGST on value of supply (9%)", formatINR(r.sgstOnAce)),

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
    note.textContent = `Cumulative LRS remittances this financial year (including this transaction) total ${formatINR(r.cumulativeAfter)}, within the ₹10,00,000 threshold, so no TCS applies yet.`;
  }

  document.getElementById("resultCard").hidden = false;
}

const INPUT_IDS = [
  "fcyAmount",
  "currency",
  "baseRate",
  "markup",
  "purpose",
  "priorLrs",
];

document.addEventListener("DOMContentLoaded", () => {
  populateCurrencies();
  INPUT_IDS.forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("input", calculate);
    el.addEventListener("change", calculate);
  });
  calculate();
});
