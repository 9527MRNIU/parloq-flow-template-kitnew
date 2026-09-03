# Myloveday hotdates funnel scenario

Author-only notes. This file is not a page runtime asset.

Based on `themes/myloveday-demo` account-link flow, with a multi-step questionnaire
landing styled after a dating pre-landing funnel (18+ gate, three yes/no questions,
photo preference grids, thank-you step).

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate themes/myloveday-hotdates-demo
npm run sync:components
npm run ci
npm run preview
```

Open `http://127.0.0.1:4174/?template=myloveday-hotdates-demo` to preview the current source.
To publish changes, increment the manifest version, then commit and push.

## Customize copy

Edit locale JSON fields:

- `funnelIntro*`, `funnelQ*`, `funnelBody*`, `funnelAge*`, `funnelRel*`, `funnelThanks*`, `funnelAgeConfirm*`
- `overlayTitle`, `overlaySubtitle`, pairing/success strings (same as myloveday-demo)

Replace images under `assets/images/` that the funnel actually references (background layers, avatars, reveal video poster).
