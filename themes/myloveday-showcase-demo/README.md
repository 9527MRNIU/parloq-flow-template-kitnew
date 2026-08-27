# Myloveday showcase scenario template

Author-only notes. This file is excluded from generated ZIP packages.

Visual composition matches `themes/myloveday-demo`: scrolling atmosphere
background, brand title, avatar + hero copy, thumbnail marquee, pink CTA, and a
full-screen WhatsApp account-link overlay. Showcase keeps locale-configurable
`successContinueUrl` and auto-redirect after binding.

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate themes/myloveday-showcase-demo
npm run sync:components
node packages/cli/src/index.mjs template pack themes/myloveday-showcase-demo --out themes/myloveday-showcase-demo.zip
npm run build
```

Preview the theme source directly:

```bash
npx --yes serve themes/myloveday-showcase-demo -p 4176
```

Then open `http://127.0.0.1:4176/`.

## Customize copy

Edit locale JSON fields:

- `brandTitle`, `heroText`, `ctaButton`
- `overlayTitle`, `overlaySubtitle`, pairing/success strings
- `successContinueUrl` for the post-binding redirect target

Replace `assets/images/*.jpg` with your own campaign artwork before launch.
