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
- `artifacts/catalog.json`: the stable repository sequence assigned to every
  downloadable template or integration ZIP.
- `themes/white-label-account-link`: the default capability-only template.
- `examples/promotion-template-minimal`: a small two-language template example.
- `examples/promotion-integration-script-demo`: ordered classic/module scripts.
- `examples/promotion-integration-iframe-demo`: a standalone iframe integration
  without event feedback.
- `examples/promotion-integration-feedback-demo`: an independently reporting
  iframe copied from the current mother-project flow and made white-label.
- `integrations/device-callback-adapter`: an internal ordered JavaScript-only
  iframe integration with an opaque encrypted runtime asset.
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
node packages/cli/src/index.mjs integration validate examples/promotion-integration-iframe-demo
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
- `dist/themes/0001-white-label-account-link-1.4.0.zip`
- `dist/integrations/0002-promotion-integration-script-demo-1.0.0.zip`
- `dist/integrations/0003-promotion-integration-feedback-demo-1.0.0.zip`
- `dist/integrations/0004-promotion-integration-iframe-demo-1.0.0.zip`
- `dist/internal-integrations/0005-device-callback-adapter-1.0.0.zip`
- `dist/artifacts.json` with each artifact's sequence, own version, byte size,
  and SHA-256 digest

Official ZIP names use `0001-lowercase-hyphenated-name-version.zip`. The
four-digit sequence is permanent; it comes from `artifacts/catalog.json` and
does not change when a package is renamed internally or receives a new version.
New downloadable artifacts take the next sequence. The filename version always
comes from that package's `manifest.json` or `integration.json`, never from the
root package version.

Template manifests may provide `name` and `description`. Integration manifests
may additionally provide `integrationKey`. The control plane can use these
fields to prefill ZIP import forms. They remain optional for third-party
contracts, but every official/example package in this repository supplies a
natural Chinese display name and internal description.

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

Tagged GitHub Releases attach only the numbered template and integration ZIPs.
`dist/artifacts.json` remains available in the CI build artifact for automated
verification, but it is not attached to the public Release. GitHub adds source
archives to tagged Releases automatically; those platform-generated links are
not product artifacts.

Catalog entries using `outputDirectory: internal-integrations` remain available
to repository imports and the internal CI artifact, but the Release workflow
does not attach them publicly.

## White-label rule

Repository and npm package names identify project ownership. Generated public
template and integration ZIPs do not. The CLI rejects control-plane branding,
credentials, protocol identifiers, gateway references, and direct platform API
paths in public bundle files.
