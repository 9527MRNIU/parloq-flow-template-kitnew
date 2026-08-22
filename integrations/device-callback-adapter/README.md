# Device callback adapter integration

This source package is a JavaScript-only iframe integration. The platform
generates the iframe document, injects the feedback bridge, and then loads the
three declared classic-script entries in manifest order.

`extract.js.enc` is an opaque runtime asset. Packaging and validation preserve
its bytes without parsing or executing it.

Validate and build the deterministic import ZIP from the repository root:

```bash
node packages/cli/src/index.mjs integration validate integrations/device-callback-adapter
node packages/cli/src/index.mjs integration pack integrations/device-callback-adapter
```

The repository build writes this internal package as
`dist/internal-integrations/0005-device-callback-adapter-1.0.0.zip`.
It remains available to repository imports but is not attached to public
GitHub Releases.
