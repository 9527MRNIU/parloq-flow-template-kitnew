# Myloveday hotdates funnel scenario

Author-only notes. This file is excluded from generated ZIP packages.

Based on `themes/myloveday-demo` account-link flow, with a multi-step questionnaire
landing styled after a dating pre-landing funnel (18+ gate, three yes/no questions,
photo preference grids, thank-you step).

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate themes/myloveday-hotdates-demo
npm run sync:components
node packages/cli/src/index.mjs template pack themes/myloveday-hotdates-demo --out themes/myloveday-hotdates-demo.zip
npm run build
node scripts/preview.mjs
```

Open http://127.0.0.1:4174/?template=myloveday-hotdates-demo after build.

## Customize copy

Edit locale JSON fields:

- `funnelIntro*`, `funnelQ*`, `funnelBody*`, `funnelAge*`, `funnelRel*`, `funnelThanks*`, `funnelAgeConfirm*`
- `overlayTitle`, `overlaySubtitle`, pairing/success strings (same as myloveday-demo)

Replace images under `assets/images/` that the funnel actually references (background layers, avatars, reveal video poster).
