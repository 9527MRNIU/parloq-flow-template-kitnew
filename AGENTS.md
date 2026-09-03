# Promotion Kit Repository Rules

- Public template and integration bundles must remain white-label. Do not place
  the control-plane product name, protocol IDs, gateway URLs, access tokens, or
  direct API paths in `themes/` or public integration source directories.
- Templates own presentation and localization only. Pairing, routing,
  authentication, analytics, and account persistence belong to the platform.
- Integrations may own their declared script/iframe browser behavior. Hosting,
  source-domain validation, injection, runtime authentication and event
  persistence belong to the platform.
- Visible phone numbers never include a leading plus sign.
- `promotion-template/v2`, `promotion-browser-bridge/v2`,
  `promotion-public-pairing/v1`, and `account-link-elements/v1` are versioned
  contracts. Breaking changes require a new version instead of an in-place
  rewrite.
- `integration.json` schema version `1` and
  `promotion-integration-bridge/v1` are also versioned contracts.
- Official/example manifests provide natural Chinese `name` and `description`;
  integration manifests also provide a lowercase machine-readable
  `integrationKey`.
- Publish updates by changing the relevant manifest version, committing source
  files, and pushing Git. Do not build downloadable archives, upload CI
  artifacts, or create release attachments as part of this workflow.
- `artifacts/catalog.json` remains the platform's source import index. Keep its
  schema, source paths, and permanent per-kind sequences compatible; new entries
  take the next sequence. It is not a download or archive manifest.
- Template CI, component synchronization, and preview read template sources
  only. Managed integration validation belongs to the platform; do not force
  new integrations through the legacy v1 example validator to publish them.
- Keep the 15 baseline locales complete and preserve RTL behavior for Arabic,
  Persian, and Urdu.
- Run `npm run ci` before committing a change that affects runtime, contracts,
  CLI validation, or template/integration source. CI runs source checks and
  tests only; it must not package or publish files.
