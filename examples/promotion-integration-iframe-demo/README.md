# Iframe integration example

This white-label example demonstrates a standalone iframe integration without
the optional event-feedback bridge. Its assets run only inside the iframe and
do not read or message the parent template.

Validate and package it from the repository root:

```bash
node packages/cli/src/index.mjs integration validate examples/promotion-integration-iframe-demo
node packages/cli/src/index.mjs integration pack examples/promotion-integration-iframe-demo
```

The repository build publishes this package as
`0004-promotion-integration-iframe-demo-1.0.0.zip`. Sequence `0004` is permanent;
the final segment follows `integration.json.version`.
