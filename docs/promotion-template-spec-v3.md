# Promotion template specification v3

Status: current for all new templates (`promotion-template/v3`).

Machine-readable schema:
[`promotion-template-v3.schema.json`](../packages/contract/schemas/promotion-template-v3.schema.json).

## Boundary

A v3 ZIP owns the complete visitor-facing template: HTML, CSS, local media,
localization and the compiled account-link components. The platform still owns
channel resolution, authentication, pairing, routing, analytics persistence,
account storage, sandboxing and CSP.

Template JavaScript may call only the injected `window.PromotionBridge`.
It must not contain API paths, access tokens, gateway addresses, protocol IDs,
external scripts or control-plane branding.

## Manifest

```json
{
  "schema": "promotion-template/v3",
  "version": "1.0.0",
  "name": "标准账号关联模板",
  "description": "自带前端组件并通过平台安全桥接完成账号关联。",
  "entry": "index.html",
  "format": "static-bundle",
  "capabilities": ["phone-pairing"],
  "runtime": "promotion-browser-bridge/v2",
  "requirements": {
    "pairingContract": "promotion-public-pairing/v1"
  },
  "components": {
    "contract": "account-link-elements/v1",
    "entry": "assets/account-link-elements.js"
  },
  "interactionProtection": "platform",
  "defaultLocale": "en",
  "supportedLocales": ["en", "zh-CN"],
  "i18n": {
    "mode": "bundled",
    "path": "locales/{locale}.json",
    "fallbackLocale": "en"
  }
}
```

`components.entry` is required, must be a safe relative JavaScript path and
must be loaded by `index.html`. Official builds generate the file from
`packages/runtime`; the final ZIP validator rejects a missing component
bundle.

## Component composition

```html
<account-link-flow>
  <phone-number-field></phone-number-field>
  <account-link-submit></account-link-submit>
  <pairing-code-panel></pairing-code-panel>
  <app-launch-actions></app-launch-actions>
  <account-link-status></account-link-status>
  <account-initialization-status></account-initialization-status>
</account-link-flow>
```

The component bundle owns country search, flags, phone formatting, accessible
controls and pairing-state presentation. The platform resolves the visitor's
locale and injects it through runtime configuration. Templates that explicitly
need a manual language selector may add the optional
`account-link-locale-switcher` element inside the flow. The bundle receives no
secret configuration and reaches platform services only through:

```ts
interface PromotionBridgeV2 {
  version: "promotion-browser-bridge/v2"
  submitPhone(phone: string, metadata?: Record<string, unknown>): Promise<Response>
  getPairingStatus(pairing: PairingHandle): Promise<Response>
  cancelPairing(pairing: PairingHandle): Promise<Response>
}
```

## Packaging and security

- The ZIP contains one `index.html`, `manifest.json`, the declared component
  entry and all relative assets.
- ZIP size is at most 20 MB, expanded content at most 50 MB, at most 500 files
  and at most 5 MB per file.
- Source maps, source files, external resources, direct API paths, credentials
  and platform identifiers are forbidden.
- Visible phone numbers never include a leading plus sign.
- The fifteen baseline locales remain complete; Arabic, Persian and Urdu retain
  RTL behavior.

The platform imports, stores and serves the bundle without replacing or
injecting its component implementation. It injects only runtime configuration,
`PromotionBridge`, tracking and interaction protection.
