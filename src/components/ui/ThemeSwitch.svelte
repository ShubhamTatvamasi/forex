<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import { THEME_OPTIONS, applyTheme, savedTheme, type ThemeChoice } from '../../lib/ui/theme';

  let theme = $state<ThemeChoice>('system');
  let open = $state(false);
  let root = $state<HTMLDivElement | null>(null);

  onMount(() => (theme = savedTheme()));

  const current = $derived(THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[0]);

  function choose(t: ThemeChoice) {
    theme = t;
    applyTheme(t);
    open = false;
  }

  function onDocClick(e: MouseEvent) {
    if (open && root && !root.contains(e.target as Node)) open = false;
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') open = false;
  }
</script>

<svelte:document onclick={onDocClick} onkeydown={onKey} />

<div class="theme-menu" bind:this={root}>
  <button
    class="btn ghost sm theme-trigger"
    aria-haspopup="menu"
    aria-expanded={open}
    title={`Theme: ${current.label}`}
    onclick={() => (open = !open)}
  >
    <Icon name={current.icon} size={16} />
    <span class="hide-sm">{current.label}</span>
    <Icon name="chevron-down" size={14} />
  </button>
  {#if open}
    <div class="theme-pop" role="menu" aria-label="Theme">
      {#each THEME_OPTIONS as o}
        <button role="menuitemradio" aria-checked={theme === o.value} class:on={theme === o.value} onclick={() => choose(o.value)}>
          <Icon name={o.icon} size={16} />
          <span>{o.label}</span>
          <span class="tick" hidden={theme !== o.value}><Icon name="check" size={15} /></span>
        </button>
      {/each}
    </div>
  {/if}
</div>
