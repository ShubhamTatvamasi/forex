<script lang="ts">
  let {
    checked,
    onchange,
    title,
    subtitle,
    disabled = false,
  }: {
    checked: boolean;
    onchange: (v: boolean) => void;
    title: string;
    subtitle?: string;
    disabled?: boolean;
  } = $props();
</script>

<label class="toggle-card" class:disabled>
  <span class="toggle-switch">
    <input type="checkbox" {checked} {disabled} onchange={(e) => onchange(e.currentTarget.checked)} />
    <span class="toggle-track"><span class="toggle-thumb"></span></span>
  </span>
  <span class="toggle-text">
    <span class="toggle-title">{title}</span>
    {#if subtitle}<span class="toggle-subtitle">{subtitle}</span>{/if}
  </span>
</label>

<style>
  .toggle-card {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px;
    border: 1px solid var(--border); border-radius: var(--r-md); background: var(--surface);
    cursor: pointer; transition: border-color var(--dur-1), background var(--dur-1);
  }
  .toggle-card:hover { border-color: var(--accent); }
  .toggle-card:has(input:checked) { border-color: var(--accent); background: var(--accent-soft); }
  .toggle-card.disabled { cursor: not-allowed; opacity: 0.7; }
  .toggle-switch { position: relative; flex-shrink: 0; width: 38px; height: 22px; }
  .toggle-switch input[type='checkbox'] { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; }
  .toggle-track { position: absolute; inset: 0; background: var(--border-strong); border-radius: var(--r-pill); transition: background var(--dur-2); }
  .toggle-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: var(--surface); box-shadow: var(--sh-1); transition: transform var(--dur-2) var(--ease-out); }
  .toggle-switch input:checked ~ .toggle-track { background: var(--accent); }
  .toggle-switch input:checked ~ .toggle-track .toggle-thumb { transform: translateX(16px); }
  .toggle-switch input:focus-visible ~ .toggle-track { outline: 2px solid var(--focus); outline-offset: 2px; }
  .toggle-text { display: flex; flex-direction: column; gap: 1px; }
  .toggle-title { font-size: 0.85rem; font-weight: 600; color: var(--text); }
  .toggle-subtitle { font-size: var(--fs-caption); color: var(--text-2); }
</style>
