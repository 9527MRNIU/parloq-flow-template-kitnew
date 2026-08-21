# Myloveday scenario template

Author-only notes. This file is excluded from generated ZIP packages.

Follows the same composition as `themes/white-label-account-link`: the standard
`account-link-flow` element tree is rendered directly on the page. Campaign
imagery and copy wrap the flow; there is no overlay, hash link, or extra CTA.

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate examples/myloveday-demo
node packages/cli/src/index.mjs template pack examples/myloveday-demo --out examples/myloveday-demo.zip
npm run build
$env:TEMPLATE_PREVIEW_THEME = "dist/themes/myloveday-demo"
node scripts/preview.mjs
```
