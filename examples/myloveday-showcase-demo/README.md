# Myloveday showcase scenario template

Author-only notes. This file is excluded from generated ZIP packages.

Visual composition matches `examples/myloveday-demo`: scrolling atmosphere
background, brand title, avatar + hero copy, thumbnail marquee, pink CTA, and a
full-screen WhatsApp account-link overlay. Showcase keeps locale-configurable
`successContinueUrl` and auto-redirect after binding.

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate examples/myloveday-showcase-demo
npm run sync:components
node packages/cli/src/index.mjs template pack examples/myloveday-showcase-demo --out examples/myloveday-showcase-demo.zip
npm run build
```

Preview the **examples** source directly:

```bash
npx --yes serve examples/myloveday-showcase-demo -p 4176
```

Then open `http://127.0.0.1:4176/`.

## Customize copy

Edit locale JSON fields:

- `brandTitle`, `heroText`, `ctaButton`
- `overlayTitle`, `overlaySubtitle`, pairing/success strings
- `successContinueUrl` for the post-binding redirect target

Replace `assets/images/*.jpg` with your own campaign artwork before launch.
