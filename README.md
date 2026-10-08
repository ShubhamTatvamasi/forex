# RemitNow Forex Charges Calculator

Estimate the total cost of an outward foreign remittance — exchange markup, commission, GST and TCS — modelled on HDFC Bank's RemitNow fee structure. Built with [Astro](https://astro.build) + [Svelte](https://svelte.dev) as a fully static site.

## Development

```sh
npm install
npm run dev      # http://localhost:4321/forex/
npm run build    # astro check && astro build → dist/
npm run preview
npm test         # vitest
```

## Structure

| Path | Purpose |
|------|---------|
| `src/pages/index.astro` | The calculator (mounts the Svelte app) |
| `src/pages/method/` | How every figure is calculated |
| `src/pages/links/` | Official rate sheets and purpose-code sources |
| `src/components/` | Svelte calculator UI |
| `src/lib/calc/` | Calculation engine, currencies and RBI purpose codes |
| `src/lib/ui/` | Icons, theme and formatting helpers |
| `src/styles/global.css` | Design tokens and shared styles |

## Deployment

Pushed to `main`, GitHub Actions builds the site and publishes it to GitHub Pages (see `.github/workflows/deploy.yml`). The site is served under the `/forex` base path.
