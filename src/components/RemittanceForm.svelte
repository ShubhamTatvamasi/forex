<script lang="ts">
  import FieldGroup from './ui/FieldGroup.svelte';
  import Stepper from './ui/Stepper.svelte';
  import Toggle from './ui/Toggle.svelte';
  import Icon from './ui/Icon.svelte';
  import { app } from './state.svelte';
  import { CURRENCIES, CURRENCY_SYMBOLS, PURPOSE_GROUPS, purposeId } from '../lib/calc/purposes';
  import { CORRESPONDENT_CHARGE_HINTS, LRS_TCS_THRESHOLD } from '../lib/calc/engine';
  import { inr0 } from '../lib/ui/format';

  const f = $derived(app.form);
  const r = $derived(app.result);

  const correspondentHint = $derived(
    f.correspondentCharge === 'full_value' && !r.fullValueEligible
      ? 'Full Value is only available for remittances in USD, EUR or GBP — select one of those currencies, or choose Self / Beneficiary instead.'
      : CORRESPONDENT_CHARGE_HINTS[f.correspondentCharge],
  );
</script>

<FieldGroup title="Remittance details" sub="Amounts, rate and purpose drive every figure below.">
  <div class="grid">
    <label class="field">
      <span>Foreign currency amount</span>
      <Stepper
        value={f.fcyAmount}
        step={1}
        decimals={2}
        grouped
        onchange={(v) => app.set('fcyAmount', v)}
        ariaLabel="Foreign currency amount"
      />
    </label>

    <label class="field">
      <span>Currency</span>
      <select value={f.currency} onchange={(e) => app.set('currency', e.currentTarget.value as typeof f.currency)}>
        {#each CURRENCIES as c}
          <option value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>
        {/each}
      </select>
    </label>

    <label class="field">
      <span>Mid-market / base rate (1 unit → INR)</span>
      <Stepper value={f.baseRate} step={0.0001} decimals={4} onchange={(v) => app.set('baseRate', v)} ariaLabel="Base rate" />
    </label>

    <label class="field">
      <span>Exchange rate markup (₹ per unit)</span>
      <Stepper value={f.markupPerUnit} step={0.0001} decimals={4} onchange={(v) => app.set('markupPerUnit', v)} ariaLabel="Markup" />
    </label>

    <label class="field span-2">
      <span>Purpose of remittance</span>
      <select value={f.purposeId} onchange={(e) => app.set('purposeId', e.currentTarget.value)}>
        {#each PURPOSE_GROUPS as g}
          <optgroup label={g.group}>
            {#each g.options as o}
              <option value={purposeId(g.group, o)}>{o.label}{o.code ? ` [${o.code}]` : ''}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
      <small>
        RBI purpose codes (Form A2) shown in brackets, grouped by RBI purpose category — the option you pick determines your TCS rate.
      </small>
    </label>

    {#if app.showPanStatus}
      <label class="field span-2 fade-in">
        <span>Your PAN status</span>
        <select value={f.panStatus} onchange={(e) => app.set('panStatus', e.currentTarget.value as typeof f.panStatus)}>
          <option value="operative">Linked to Aadhaar / operative</option>
          <option value="inoperative">Inoperative (not linked to Aadhaar)</option>
        </select>
        <small>
          Only affects the TCS rate for education (self-funded) / medical treatment remittances — the rate rises from 2% to 5% above
          ₹10 lakh if your PAN is inoperative. Doesn't apply to loan-funded education (always 0%) or other purposes (always 20%).
        </small>
      </label>
    {/if}

    <div class="field span-2">
      <span>LRS remittances already made this FY (₹)</span>
      <Stepper
        value={f.priorLrs}
        step={1000}
        decimals={0}
        grouped
        onchange={(v) => app.set('priorLrs', v)}
        ariaLabel="Prior LRS amount"
      />
      <Toggle
        checked={f.priorLrsOverThreshold}
        onchange={(v) => app.set('priorLrsOverThreshold', v)}
        title={`Already crossed ${inr0(LRS_TCS_THRESHOLD)} this FY`}
        subtitle={`Sets the amount above to ${inr0(LRS_TCS_THRESHOLD)} automatically`}
      />
      <small>
        Used to check the ₹10,00,000 TCS threshold, which applies per financial year across all LRS remittances, not per transaction.
      </small>
    </div>

    <label class="field span-2">
      <span>Correspondent bank charges to be borne by</span>
      <select
        value={f.correspondentCharge}
        onchange={(e) => app.set('correspondentCharge', e.currentTarget.value as typeof f.correspondentCharge)}
      >
        <option value="self">Self</option>
        <option value="beneficiary">Beneficiary</option>
        <option value="full_value">Full Value (USD / EUR / GBP only)</option>
      </select>
      <small>{correspondentHint}</small>
      {#if r.fullValueEligible && f.correspondentCharge !== 'full_value'}
        <p class="recommendation">
          <Icon name="check-circle" size={15} />
          Recommended: switch to Full Value — available for this currency, and it guarantees zero correspondent bank charges at no extra cost.
        </p>
      {/if}
    </label>

    <div class="field span-2">
      <span>Amount paid to CRED (₹)</span>
      <Stepper
        value={f.credAmountPaid}
        step={1}
        decimals={2}
        grouped
        onchange={(v) => app.set('credAmountPaid', v)}
        ariaLabel="Amount paid to CRED"
      />
      <small>
        CRED debits a buffer upfront to absorb forex rate fluctuations — typically more than the final Amount of Currency Exchanged (ACE).
        The excess over ACE is later refunded as CRED Cash. Leave as 0 if not applicable.
      </small>
    </div>
  </div>
</FieldGroup>

<style>
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }
  .span-2 { grid-column: span 2; }
  .recommendation { display: flex; align-items: flex-start; gap: 6px; font-size: var(--fs-caption); font-weight: 600; color: var(--success-text); margin: 2px 0 0; }
  .recommendation :global(.icon) { margin-top: 1px; }
  @media (max-width: 520px) {
    .grid { grid-template-columns: 1fr; }
    .span-2 { grid-column: span 1; }
  }
  @media (prefers-reduced-motion: no-preference) {
    .fade-in { animation: fade-in var(--dur-3) var(--ease-out); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: none; }
  }
</style>
