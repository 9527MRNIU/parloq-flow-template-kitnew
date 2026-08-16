# Template Kit Repository Rules

- Public theme bundles must remain white-label. Do not place the control-plane
  product name, protocol IDs, gateway URLs, access tokens, or direct API paths
  in `themes/` or generated theme ZIP files.
- Templates own presentation and localization only. Pairing, routing,
  authentication, analytics, and account persistence belong to the platform.
- Visible phone numbers never include a leading plus sign.
- `promotion-template/v2`, `promotion-browser-bridge/v2`,
  `promotion-public-pairing/v1`, and `account-link-elements/v1` are versioned
  contracts. Breaking changes require a new version instead of an in-place
  rewrite.
- Keep the 15 baseline locales complete and preserve RTL behavior for Arabic,
  Persian, and Urdu.
- Run `npm run ci` before committing a change that affects runtime, contracts,
  CLI validation, or a bundled theme.
