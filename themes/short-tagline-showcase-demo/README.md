# Short-drama showcase scenario template

Author-only notes. This file is not a page runtime asset.

A copy of `themes/short-tagline-demo` for scene customization: poster showcase,
hook copy, auto-scrolling episode strip, bottom CTA, and a full-screen account-link
overlay after the CTA is tapped.

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate themes/short-tagline-showcase-demo
npm run sync:components
npm run ci
npm run preview
```

Open `http://127.0.0.1:4174/?template=short-tagline-showcase-demo` to preview the current source.
To publish changes, increment the manifest version, then commit and push.

## Customize copy

Edit locale JSON fields:

- `dramaTitle`, `hook`, `episodeLabel`, `ctaButton`
- `tag1`, `tag2`, `tag3`, `statViews`, `statRating`
- `overlayTitle`, `overlaySubtitle`, pairing/success strings

Replace `assets/images/poster.svg`, `episode-*.svg`, and `og-image.svg` with
your own drama artwork before launch. `poster.mp4` is optional for local preview;
confirm platform file-type policy before committing video resources.
