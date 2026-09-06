# Iframe integration example

This white-label example demonstrates a standalone iframe integration without
the optional event-feedback bridge. Its assets run only inside the iframe and
do not read or message the parent template.

Validate and package it from the repository root:

```bash
node packages/cli/src/index.mjs integration validate examples/promotion-integration-iframe-demo
node packages/cli/src/index.mjs integration pack examples/promotion-integration-iframe-demo
```

This directory is a source-only contract example. It is intentionally not
registered in `artifacts/catalog.json` and is not published as a numbered ZIP.
