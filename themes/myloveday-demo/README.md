# Myloveday scenario template

Author-only notes. This file is not a page runtime asset.

Follows the same v3 composition as `themes/white-label-account-link`: the
standard `account-link-flow` element tree and its compiled component runtime are
bundled directly in the template. Campaign imagery wraps a two-stage landing:
first a scrolling hero with CTA, then a full-screen overlay for account linking.

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate themes/myloveday-demo
npm run sync:components
npm run ci
npm run preview
```

Open `http://127.0.0.1:4174/?template=myloveday-demo` to preview the current source.
To publish changes, increment the manifest version, then commit and push.

Expected first screen: scrolling background, Myloveday title, avatar + hero copy, bottom thumbnail strip, pink CTA button. The login overlay (`#main-container`) stays hidden until the CTA is clicked.
