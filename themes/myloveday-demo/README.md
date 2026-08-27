# Myloveday scenario template

Author-only notes. This file is excluded from generated ZIP packages.

Follows the same v3 composition as `themes/white-label-account-link`: the
standard `account-link-flow` element tree and its compiled component runtime are
bundled directly in the template. Campaign imagery wraps a two-stage landing:
first a scrolling hero with CTA, then a full-screen overlay for account linking.

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate themes/myloveday-demo
npm run sync:components
node packages/cli/src/index.mjs template pack themes/myloveday-demo --out themes/myloveday-demo.zip
npm run build
```

Preview the theme source directly (the built-in preview server serves `dist/`, which lags until you run `npm run build`):

```bash
npx --yes serve themes/myloveday-demo -p 4175
```

Then open `http://127.0.0.1:4175/`.

Expected first screen: scrolling background, Myloveday title, avatar + hero copy, bottom thumbnail strip, pink CTA button. The login overlay (`#main-container`) stays hidden until the CTA is clicked.
