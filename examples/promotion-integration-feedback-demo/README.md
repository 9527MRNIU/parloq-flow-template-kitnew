# Iframe feedback integration example

This white-label example mirrors the current managed iframe integration in the
control plane. It obtains its own runtime context, reports `ready`, and lets a
tester report `completed` or `failed` without reading or messaging the parent
template.

Validate and build the deterministic import ZIP from the repository root:

```bash
node packages/cli/src/index.mjs integration validate examples/promotion-integration-feedback-demo
node packages/cli/src/index.mjs integration pack examples/promotion-integration-feedback-demo
```

The bridge is injected only when the imported integration is bound to an
enabled template and rendered through an enabled channel. Opening `index.html`
directly therefore shows the expected "runtime unavailable" state.
