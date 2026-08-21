# Myloveday scenario template

Author-only notes. This file is excluded from generated ZIP packages.

Visual reference: [myloveday.falan123.com](https://myloveday.falan123.com/?key=tlajvc4&pixelId=2109538159611068)

## Local assets

Images under `assets/images/` were downloaded from the reference CDN where accessible.
`changtu.jpg`, `cs1.jpg`, and `og-image.jpg` fall back to sibling images when the CDN
returned a block page during export.

## Validate and preview

```bash
node packages/cli/src/index.mjs template validate examples/myloveday-demo
npm run build
npm run preview
```

The landing CTA opens the account-link overlay through the `#account-link` hash.
Pairing, polling, and runtime injection remain platform-owned.
