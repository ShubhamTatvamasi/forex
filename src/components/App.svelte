<script lang="ts">
  import Icon from './ui/Icon.svelte';
  import ThemeSwitch from './ui/ThemeSwitch.svelte';
  import RemittanceForm from './RemittanceForm.svelte';
  import Breakdown from './Breakdown.svelte';
  import { app } from './state.svelte';
  import { BASE } from '../lib/ui/format';
</script>

<div class="shell">
  <header class="topnav">
    <a class="brand" href={BASE}>
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 9h13M13 5l4 4-4 4" />
          <path d="M20 15H7M11 11l-4 4 4 4" />
        </svg>
      </span>
      <span>RemitNow Forex</span>
    </a>
    <nav class="nav-links" aria-label="Guides">
      <a href={`${BASE}method/`}><Icon name="exchange" size={17} />How it's calculated</a>
      <a href={`${BASE}links/`}><Icon name="external" size={17} />Useful links</a>
    </nav>
    <div class="nav-right">
      <button class="btn ghost sm" onclick={() => app.reset()}><Icon name="refresh" size={16} /><span class="hide-sm">Reset</span></button>
      <ThemeSwitch />
    </div>
  </header>

  <div class="hero-band">
    <div class="hero-inner">
      <span class="badge"><Icon name="shield" size={14} />Runs entirely in your browser · nothing is uploaded</span>
      <h1>Estimate the true cost of an outward remittance.</h1>
      <p class="lead">
        Exchange markup, commission, GST and TCS — modelled on HDFC Bank's RemitNow fee structure, with every line item shown so you can
        check it against your statement.
      </p>
    </div>
  </div>

  <main class="content">
    <div class="layout">
      <div class="col-form">
        <RemittanceForm />
      </div>
      <div class="col-result">
        <Breakdown />
      </div>
    </div>
  </main>

  <footer class="foot">
    <span>Static, client-side calculator. No data leaves your browser.</span>
    <span class="faint">An independent educational estimator — not an official HDFC Bank tool.</span>
  </footer>
</div>

<style>
  .shell { min-height: 100dvh; display: flex; flex-direction: column; }
  .content { flex: 1; width: 100%; max-width: 1200px; margin: 0 auto; padding: 32px 32px 56px; }
  .layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; align-items: start; }
  .layout > * { min-width: 0; }
  @media (min-width: 900px) {
    .layout { grid-template-columns: minmax(360px, 46fr) minmax(400px, 54fr); }
    .col-result { position: sticky; top: 88px; }
  }
  .foot { display: flex; flex-direction: column; gap: 4px; text-align: center; padding: 24px 32px 40px; font-size: var(--fs-caption); color: var(--text-2); }
  @media (max-width: 720px) {
    .content { padding: 20px 16px 40px; }
    .hide-sm { display: none; }
  }
</style>
