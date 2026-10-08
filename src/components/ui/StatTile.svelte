<script lang="ts">
  import Icon from './Icon.svelte';

  let {
    label,
    value,
    sub,
    icon,
    tone,
    hero,
  }: { label: string; value: string; sub?: string; icon?: string; tone?: 'neg' | 'pos'; hero?: boolean } = $props();
</script>

<div class="tile" class:hero>
  <span class="t-label">{#if icon}<Icon name={icon} size={16} />{/if}{label}</span>
  <span class="t-value num" class:neg={tone === 'neg'}>{value}</span>
  {#if sub}<span class="t-sub">{sub}</span>{/if}
</div>

<style>
  .tile { display: grid; align-content: start; gap: 4px; min-height: 96px; padding: 16px 18px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--sh-1); }
  .tile.hero { background: var(--accent); border-color: var(--accent); }
  .tile.hero .t-label { color: color-mix(in srgb, var(--on-accent) 78%, transparent); }
  .tile.hero .t-label :global(.icon) { color: color-mix(in srgb, var(--on-accent) 78%, transparent); }
  .tile.hero .t-value { color: var(--on-accent); }
  .tile.hero .t-sub { color: color-mix(in srgb, var(--on-accent) 78%, transparent); }
  .t-label { display: flex; align-items: center; gap: 6px; font-size: var(--fs-caption); font-weight: 500; color: var(--text-2); }
  .t-label :global(.icon) { color: var(--text-3); }
  .t-value { font-size: var(--fs-stat); font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; overflow-wrap: anywhere; }
  .tile.hero .t-value { font-size: 1.75rem; }
  .t-value.neg { color: var(--danger-text); }
  .t-sub { font-size: 13px; color: var(--text-3); }
</style>
