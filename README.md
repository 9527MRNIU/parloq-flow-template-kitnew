# Parloq Flow Promotion Kit

Independent source repository for promotion landing-page templates, managed
script/iframe integration packages, and the white-label account-linking
capability consumed by Parloq Flow.

The repository separates public bundle releases from the control plane while
keeping the package names and contracts aligned with the mother project:
`PromotionTemplate` and `PromotionIntegration` are parallel artifact classes.

## What lives here

- `packages/runtime`: platform-owned browser elements for the account-link flow.
- `packages/components`: the canonical custom-element composition for templates.
- `packages/contract`: template, integration-manifest, browser-bridge and iframe
  feedback TypeScript contracts plus JSON Schemas.
- `packages/cli`: validation and deterministic ZIP packaging for both artifact
  classes.
- `themes/white-label-account-link`: the default capability-only template.
- `examples/promotion-template-minimal`: a small two-language template example.
- `examples/promotion-integration-script-demo`: ordered classic/module scripts.
- `examples/promotion-integration-feedback-demo`: an independently reporting
  iframe copied from the current mother-project flow and made white-label.
- `docs`: architecture, authoring, contracts, AI generation, and copy sources.

Templates own presentation and localization only. Integration bundles may own
their declared browser behavior, while hosting, injection order, source-domain
validation, session authentication, event persistence, pairing, routing and
account state remain platform responsibilities.

## Quick start

Requires Node.js 22 or newer.

```bash
npm install
npm run ci
```

Useful commands:

```bash
npm run validate
npm run build
npm run preview
node packages/cli/src/index.mjs template validate examples/promotion-template-minimal
node packages/cli/src/index.mjs integration validate examples/promotion-integration-script-demo
node packages/cli/src/index.mjs integration pack examples/promotion-integration-feedback-demo
```

The legacy template-only command form remains supported, so existing scripts
using `promotion-template validate|build|pack` do not need an immediate change.

The local template preview opens at `http://127.0.0.1:4174`. Its management-only
toolbar switches viewport, locale, and pairing/initialization state without
creating a real account.

`npm run build` produces:

- `dist/runtime/account-link-elements.js`
- `dist/packages/promotion-contract.js`
- `dist/packages/template-contract.js` (compatibility alias)
- `dist/schemas/promotion-template-v1.schema.json`
- `dist/schemas/promotion-template-v2.schema.json`
- `dist/schemas/promotion-integration-v1.schema.json`
- `dist/themes/white-label-account-link.zip`
- `dist/integrations/promotion-integration-script-demo.zip`
- `dist/integrations/promotion-integration-feedback-demo.zip`
- `dist/artifacts.json` with byte sizes and SHA-256 digests

## Release boundary

The control plane consumes pinned runtime and ZIP artifacts. It must never read
this repository's moving branch at request time.

| Layer | Current contract |
| --- | --- |
| Template manifest | `promotion-template/v2` |
| Template browser bridge | `promotion-browser-bridge/v2` |
| Public pairing | `promotion-public-pairing/v1` |
| Account-link components | `account-link-elements/v1` |
| Integration manifest | `integration.json` schema version `1` |
| Iframe feedback bridge | `promotion-integration-bridge/v1` |

Breaking behavior creates a new contract version. Existing versions remain
buildable for channels that have not migrated.

## White-label rule

Repository and npm package names identify project ownership. Generated public
template and integration ZIPs do not. The CLI rejects control-plane branding,
credentials, protocol identifiers, gateway references, and direct platform API
paths in public bundle files.
