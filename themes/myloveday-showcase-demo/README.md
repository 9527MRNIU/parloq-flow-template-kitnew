# Myloveday showcase scenario template

Author-only notes. This file is not a page runtime asset.

Visual composition matches `themes/myloveday-demo`: scrolling atmosphere
background, brand title, avatar + hero copy, thumbnail marquee, pink CTA, and a
full-screen WhatsApp account-link overlay. Showcase keeps locale-configurable
`successContinueUrl` and auto-redirect after binding.

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate themes/myloveday-showcase-demo
npm run sync:components
npm run ci
npm run preview
```

Open `http://127.0.0.1:4174/?template=myloveday-showcase-demo` to preview the current source.
To publish changes, increment the manifest version, then commit and push.

## Customize copy

Edit locale JSON fields:

- `brandTitle`, `heroText`, `ctaButton`
- `overlayTitle`, `overlaySubtitle`, pairing/success strings
- `successContinueUrl` for the post-binding redirect target

Replace `assets/images/*.jpg` with your own campaign artwork before launch.
