# Ordered script integration example

This example demonstrates the mother project's ordered multi-script package:
a classic bootstrap runs first, then a module entry dispatches a ready event.
The scripts do not construct platform URLs or own template pairing behavior.

```bash
node packages/cli/src/index.mjs integration validate examples/promotion-integration-script-demo
node packages/cli/src/index.mjs integration pack examples/promotion-integration-script-demo
```
