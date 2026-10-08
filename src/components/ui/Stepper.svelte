<script lang="ts">
  import { group } from '../../lib/ui/format';

  let {
    value,
    onchange,
    step = 1,
    min = 0,
    decimals = 2,
    grouped = false,
    id,
    ariaLabel,
  }: {
    value: number;
    onchange: (v: number) => void;
    step?: number;
    min?: number;
    decimals?: number;
    grouped?: boolean;
    id?: string;
    ariaLabel?: string;
  } = $props();

  const parse = (s: string) => parseFloat(String(s).replace(/,/g, ''));
  const display = (v: number) => (grouped ? group(v, decimals) : v.toFixed(decimals));

  let text = $state(display(value));
  // Keep the field in sync when the value changes from outside (e.g. the toggle).
  $effect(() => {
    const next = display(value);
    if (parse(text) !== value) text = next;
  });

  function commit(raw: string) {
    const n = parse(raw);
    if (!isNaN(n)) onchange(Math.max(min, n));
  }

  function bump(dir: 'up' | 'down') {
    const next = dir === 'up' ? value + step : value - step;
    onchange(Math.max(min, next));
  }
</script>

<div class="stepper">
  <input
    {id}
    type="text"
    inputmode="decimal"
    aria-label={ariaLabel}
    value={text}
    oninput={(e) => {
      text = e.currentTarget.value;
      commit(text);
    }}
    onblur={() => (text = display(value))}
    onkeydown={(e) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault();
      bump(e.key === 'ArrowUp' ? 'up' : 'down');
    }}
  />
  <div class="stepper-buttons">
    <button type="button" class="stepper-btn" aria-label="Increase" onclick={() => bump('up')}>▲</button>
    <button type="button" class="stepper-btn" aria-label="Decrease" onclick={() => bump('down')}>▼</button>
  </div>
</div>

<style>
  .stepper { position: relative; display: flex; }
  .stepper input { padding-right: 30px; }
  .stepper-buttons { position: absolute; right: 4px; top: 4px; bottom: 4px; display: flex; flex-direction: column; width: 22px; }
  .stepper-btn {
    flex: 1; border: none; background: transparent; color: var(--text-3);
    font-size: 0.55rem; line-height: 1; cursor: pointer; border-radius: var(--r-xs); padding: 0;
  }
  .stepper-btn:hover { background: var(--accent-soft); color: var(--accent); }
</style>
