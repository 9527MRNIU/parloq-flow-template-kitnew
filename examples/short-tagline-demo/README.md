# Short-drama scenario template

Author-only notes. This file is excluded from generated ZIP packages.

A scene-based mini-drama promotion landing page modeled after `myloveday-demo`:
poster showcase, hook copy, auto-scrolling episode strip, bottom CTA, and a
full-screen account-link overlay after the CTA is tapped.

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate examples/short-tagline-demo
npm run sync:components
node packages/cli/src/index.mjs template pack examples/short-tagline-demo --out examples/short-tagline-demo.zip
npm run build
node scripts/preview.mjs
```

Open http://127.0.0.1:4174/?template=short-tagline-demo after build.

## Customize copy

Edit locale JSON fields:

- `dramaTitle`, `hook`, `episodeLabel`, `ctaButton`
- `tag1`, `tag2`, `tag3`, `statViews`, `statRating`
- `overlayTitle`, `overlaySubtitle`, pairing/success strings

Replace `assets/images/poster.svg`, `episode-*.svg`, and `og-image.svg` with
your own drama artwork before launch. `poster.mp4` is optional for local preview;
confirm platform file-type policy before shipping video in a ZIP.
