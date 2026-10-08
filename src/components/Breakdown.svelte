<script lang="ts">
  import StatTile from './ui/StatTile.svelte';
  import Icon from './ui/Icon.svelte';
  import { app } from './state.svelte';
  import { CURRENCY_SYMBOLS } from '../lib/calc/purposes';
  import { LRS_ANNUAL_LIMIT_USD, LRS_TCS_THRESHOLD } from '../lib/calc/engine';
  import { inr, inr0 } from '../lib/ui/format';

  const r = $derived(app.result);

  type Row = { label: string; value?: string; kind?: 'section' | 'subtotal' | 'note' | 'tcs' };

  const rows = $derived.by<Row[]>(() => {
    const out: Row[] = [
      { label: 'Effective exchange rate', value: `1 ${r.currency} (${CURRENCY_SYMBOLS[r.currency]}) = ₹${r.effectiveRate.toFixed(4)}` },
      { label: `Amount of Currency Exchanged (${CURRENCY_SYMBOLS[r.currency]}${r.fcyAmount.toLocaleString('en-IN')} ${r.currency})`, value: inr(r.ace) },

      { label: 'Fees & Commission', kind: 'section' },
      { label: 'RemitNow commission', value: inr(r.commission) },
      { label: 'CGST on commission (9%)', value: inr(r.cgstOnCommission) },
      { label: 'SGST on commission (9%)', value: inr(r.sgstOnCommission) },
      { label: 'Total Fees & Commission', value: inr(r.totalCommissionCharges), kind: 'subtotal' },

      { label: 'GST on Amount of Currency Exchanged', kind: 'section' },
      { label: `Applicable GST slab: ${r.gstRateLabel} (min ₹${r.gstMin}, max ₹${r.gstMax.toLocaleString('en-IN')})`, kind: 'note' },
      { label: 'Value of supply (tax base only — not a charge)', value: inr(r.supplyValue), kind: 'note' },
      { label: 'CGST on value of supply (9%)', value: inr(r.cgstOnAce) },
      { label: 'SGST on value of supply (9%)', value: inr(r.sgstOnAce) },
      { label: `Total GST on ACE (effective ${r.effectiveGstPct.toFixed(3)}% of ACE)`, value: inr(r.totalGstOnAce), kind: 'subtotal' },

      { label: 'Tax Collected at Source', kind: 'section' },
      { label: `TCS @ ${r.tcsRatePct.toFixed(0)}% on ${inr(r.taxableForTcs)}`, value: inr(r.tcs), kind: 'tcs' },

      { label: 'Total charges (commission + GST + TCS)', value: inr(r.totalCharges), kind: 'subtotal' },
      { label: 'Total amount payable', value: inr(r.totalPayable), kind: 'subtotal' },
    ];

    if (r.credAmountPaid > 0) {
      out.push(
        { label: 'CRED CashBack', kind: 'section' },
        { label: 'Amount paid to CRED', value: inr(r.credAmountPaid) },
        { label: 'Amount of Currency Exchanged (ACE)', value: inr(r.ace) },
        { label: 'CRED CashBack (amount paid to CRED − ACE)', value: inr(r.credCashback), kind: 'subtotal' },
      );
    }
    return out;
  });

  const thresholdNote = $derived(
    r.cumulativeAfter > LRS_TCS_THRESHOLD
      ? `Cumulative LRS remittances this financial year (including this transaction) reach ${inr(r.cumulativeAfter)}, which is above the ₹10,00,000 TCS threshold. TCS is recoverable — you can claim it as a credit against your income tax liability, or as a refund when filing your return.`
      : `Cumulative LRS remittances this financial year (including this transaction) total ${inr(r.cumulativeAfter)}, within the ₹10,00,000 threshold, so no TCS applies yet. Headroom remaining this FY: ${inr(LRS_TCS_THRESHOLD - r.cumulativeAfter)} — any further LRS remittance above that will trigger TCS on the excess (informational only, not tax advice).`,
  );

  const lrsLimitNote = $derived(
    r.cumulativeAfterUsd > LRS_ANNUAL_LIMIT_USD
      ? `This transaction takes your FY LRS total to an estimated $${r.cumulativeAfterUsd.toFixed(0)} — above the USD ${LRS_ANNUAL_LIMIT_USD.toLocaleString('en-US')} Liberalised Remittance Scheme annual cap. This is a hard regulatory limit (not just a tax threshold); remittances beyond it are not permitted this financial year without RBI approval.`
      : r.lrsUsdRemaining <= 20_000
        ? `Approaching the LRS annual cap: an estimated $${r.lrsUsdRemaining.toFixed(0)} of headroom remains out of USD ${LRS_ANNUAL_LIMIT_USD.toLocaleString('en-US')} for this financial year (based on the indicative USD/INR rate).`
        : '',
  );

  const commissionSlabNote = $derived(
    r.commissionSlabGapUsd !== null && r.commissionSlabGapUsd <= 25
      ? `You're $${r.commissionSlabGapUsd.toFixed(2)} above the $500 commission slab boundary, where commission jumps from ₹500 to ₹1,000. If you have flexibility in the amount, remitting $500 or less would halve the commission.`
      : '',
  );
</script>

<div class="result">
  <div class="hero">
    <StatTile hero label="Total payable (debit to account)" value={inr(r.totalPayable)} />
    <StatTile label="Amount of Currency Exchanged (ACE)" value={inr(r.ace)} />
    <StatTile label="Total charges (commission + GST + TCS)" value={inr(r.totalCharges)} />
  </div>

  <div class="table-wrap">
    <table class="data breakdown">
      <tbody>
        {#each rows as row}
          <tr class={row.kind ?? ''}>
            <td>{row.label}</td>
            {#if row.kind !== 'section'}<td class="r">{row.value}</td>{/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="notes">
    <p class="disclaimer">{thresholdNote}</p>
    {#if lrsLimitNote}
      <p class="disclaimer warn"><Icon name="warn" size={15} />{lrsLimitNote}</p>
    {/if}
    {#if commissionSlabNote}
      <p class="disclaimer accent"><Icon name="info" size={15} />{commissionSlabNote}</p>
    {/if}
  </div>
</div>

<style>
  .result { display: grid; gap: 16px; }
  .hero { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .hero :global(.tile:first-child) { grid-column: 1 / -1; }
  .breakdown td:first-child { width: 62%; }
  .breakdown tr.section td {
    padding-top: 16px; font-size: var(--fs-overline); font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.04em; color: var(--text-3); border-bottom: none;
  }
  .breakdown tr.subtotal td { font-weight: 700; border-top: 2px solid var(--border-strong); border-bottom: none; }
  .breakdown tr.tcs td { color: var(--warn-text); }
  .breakdown tr.note td { font-style: italic; color: var(--text-3); }
  .notes { display: grid; gap: 8px; border-top: 1px solid var(--border); padding-top: 12px; }
  .disclaimer { display: flex; gap: 6px; font-size: var(--fs-caption); color: var(--text-2); }
  .disclaimer :global(.icon) { margin-top: 2px; flex: none; }
  .disclaimer.warn { color: var(--warn-text); }
  .disclaimer.accent { color: var(--accent-soft-text); }
  @media (max-width: 640px) {
    .hero { grid-template-columns: 1fr; }
  }
</style>
