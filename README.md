# Parloq Flow Template Kit

Independent source repository for promotion landing-page templates and the
white-label account-linking capability used by Parloq Flow.

The repository separates theme release cadence from the control plane while
keeping one versioned contract. Public bundles produced here contain no
control-plane branding, protocol identifiers, gateway URLs, credentials, or
hand-written pairing requests.

## What lives here

- `packages/runtime`: browser custom elements for phone parsing, browser-locale
  country detection, pairing-code display/copy, localized official linking
  guidance, App launch, polling, terminal states, and initialization status.
- `packages/components`: the canonical custom-element composition for a theme.
- `packages/contract`: TypeScript contracts and v1/v2 JSON Schemas.
- `packages/cli`: template validation, deterministic build, and ZIP packaging.
- `themes/white-label-account-link`: the default capability-only theme.
- `examples/minimal-theme`: a small two-language authoring example.
- `docs`: architecture, authoring, AI-generation, and source-copy guidance.

The platform still owns channel routing, protocol-node selection, account-group
assignment, pairing authentication, analytics delivery, and account storage.

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
npm run pack
npm run preview
node packages/cli/src/index.mjs validate examples/minimal-theme
```

The local preview opens at `http://127.0.0.1:4174`. Its management-only toolbar
switches viewport, locale, and every pairing/initialization state without
changing theme files or creating a real account.

`npm run build` produces:

- `dist/runtime/account-link-elements.js`
- `dist/themes/white-label-account-link.zip`
- `dist/schemas/*.json`
- `dist/artifacts.json` with byte sizes and SHA-256 digests

## Release boundary

The control plane consumes a pinned runtime artifact and a pinned theme ZIP.
It must never read this repository's moving branch at request time. A release
records all four compatible versions:

| Layer | Current contract |
| --- | --- |
| Template manifest | `promotion-template/v2` |
| Browser bridge | `promotion-browser-bridge/v2` |
| Public pairing | `promotion-public-pairing/v1` |
| Component kit | `account-link-elements/v1` |

Breaking behavior creates a new contract version. Existing versions remain
buildable for channels that have not migrated.

## White-label rule

Repository and npm package names identify project ownership. Generated public
themes do not. The CLI rejects product-control-plane branding and direct
backend/gateway integration in public files.
