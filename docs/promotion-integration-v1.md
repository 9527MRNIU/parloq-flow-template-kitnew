# Promotion integration specification v1

Status: v1 compatibility reference for script/iframe integrations and the v1
feedback bridge. Managed integrations are synchronized from Git and validated
by the platform's current importer. Do not change a newer integration's declared
type merely to satisfy this legacy example validator.

Machine-readable manifest schema:
[`promotion-integration-v1.schema.json`](../packages/contract/schemas/promotion-integration-v1.schema.json).

## Boundary

An integration is browser behavior imported from its repository source directory
and attached to one or more promotion templates by the platform. It is separate
from a template source directory:

- script integrations run in the rendered template page;
- iframe integrations run as an independently hosted hidden document;
- the platform owns domain validation, hosting, CSP, injection, session
  authentication and event persistence;
- integration source must not construct private platform endpoints or contain
  credentials, protocol IDs or gateway details.

## Package discovery

`integration.json` is optional. Without it, the importer follows the mother
project's deterministic discovery rules:

- a unique `index.html`, or the only HTML file, becomes an iframe entry;
- when there is no HTML, all `.js` and `.mjs` files become script entries in
  normalized path order;
- `.mjs` is inferred as `module`; `.js` is inferred as `classic`;
- multiple possible iframe entries require an explicit manifest.

Integration assets may live at the declared source root or under subdirectories.
The platform owns source import and metadata filtering.

## Manifest

Use a manifest when type, version, entry, script order, module behavior or iframe
feedback must be explicit.

Ordered script package:

```json
{
  "schemaVersion": 1,
  "type": "script",
  "version": "2.0.0",
  "integrationKey": "ordered-script-demo",
  "name": "有序脚本集成示例",
  "description": "演示按照清单顺序加载普通脚本与模块脚本。",
  "entries": [
    "scripts/bootstrap.js",
    { "path": "scripts/runtime.mjs", "scriptType": "module" }
  ]
}
```

Feedback-enabled iframe package:

```json
{
  "schemaVersion": 1,
  "type": "iframe",
  "version": "1.0.0",
  "integrationKey": "feedback-frame-demo",
  "name": "独立回传集成示例",
  "description": "演示内嵌框架独立获取运行上下文并回传声明事件。",
  "entry": "index.html",
  "feedback": {
    "enabled": true,
    "events": ["ready", "completed", "failed"]
  }
}
```

Rules:

- `type` is `script` or `iframe`;
- script integrations may declare multiple ordered `.js`/`.mjs` entries;
- `scriptType` is `classic` or `module`;
- iframe integrations declare either exactly one `.html`/`.htm` entry or one
  or more ordered `.js`/`.mjs` entries; HTML and JavaScript entries cannot be
  mixed;
- JavaScript-only iframe integrations use a platform-generated same-origin
  document that loads the feedback bridge before the declared entries;
- `version` contains at most 40 letters, digits, dots, underscores or hyphens;
- repository updates provide an explicit `version`; version fallbacks for
  third-party sources remain platform-owned;
- `integrationKey` contains 1–80 lowercase ASCII letters, digits, dots,
  underscores or hyphens, and starts and ends with a letter or digit;
- `name` contains 1–120 characters and `description` at most 2000 characters;
- `integrationKey`, `name`, and `description` are optional contract fields that
  the control plane may use when importing source metadata;
- official and example packages in this repository provide a machine-readable
  `integrationKey` plus non-empty natural Chinese `name` and `description`;
- repository-managed internal sources may set `visibility` to `internal`;
  they remain importable through the source catalog and are excluded from the
  public white-label scan in the v1 compatibility validator;
- feedback is available only to iframe integrations;
- `page_view` and `visit_end` are built in and should not be declared;
- at most 32 custom event names are allowed, using lowercase letters, digits,
  dots, underscores and hyphens.

## Iframe feedback bridge

The platform injects `window.PromotionIntegrationBridge` into a feedback-enabled
iframe. The iframe does not use `postMessage` and does not depend on parent
template code.

```js
const context = await window.PromotionIntegrationBridge.ready();
await window.PromotionIntegrationBridge.report("completed", {
  result: "ok",
  integrationVersion: context.integration.version
});
```

The bridge version is `promotion-integration-bridge/v1`. `ready()` exposes the
current integration, channel, template and declared-event context. `report()`
accepts only a declared custom event and a plain JSON metadata object. Platform
rate limits, idempotency, visitor identity, device fingerprint policy and the
short-lived reporting session are deliberately not implemented by package code.
When reporting is limited, the bridge response is `429` with the stable
`report_rate_limited` code and `Retry-After`; integration code should stop the
current retry loop and wait for that interval.

## Limits and files

The local v1 compatibility validator applies the following source limits.
Managed integration imports remain subject to the platform's current contract.

- source content: at most 100 MB;
- files: at most 500;
- one file: at most 40 MB;
- `integration.json`: at most 64 KB;
- allowed assets: HTML, CSS, JavaScript, JSON, common raster/SVG images, icons,
  WOFF/WOFF2/TTF fonts, text, WebAssembly and opaque `.enc` binary files;
- absolute paths, traversal, duplicates, symbolic links and unsupported file
  extensions are rejected.

Managed source entries keep the permanent integration sequence recorded in
`artifacts/catalog.json`. The integration sequence is independent from the
template sequence and starts at `0001`; new entries take the next number.
Publish updates by changing the source manifest version, committing the files,
and pushing Git. No archive or release attachment is needed.

## Injection behavior

The platform injects all active script entries in configured integration order,
then injects iframe entries. Classic scripts use `defer`; module entries use
`type="module"`. Each script entry receives platform-calculated SHA-384
integrity metadata. Only enabled integrations with enabled bindings, a ready
source domain and a valid current package are distributed.

Compatibility fixtures are created dynamically by the CLI test suite rather
than stored alongside managed integration sources.
