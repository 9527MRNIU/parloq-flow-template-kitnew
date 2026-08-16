# Architecture and ownership

## Repository boundary

This repository owns portable presentation capabilities:

1. a browser runtime made of custom elements;
2. theme HTML, CSS, media, and localized copy;
3. manifest and bridge type definitions;
4. validation and packaging tools;
5. reference themes and authoring guidance.

The Parloq Flow repository remains authoritative for server behavior:

1. channel and domain resolution;
2. protocol-node and fallback-pool routing;
3. account-group and fixed-proxy assignment;
4. public start/status/cancel authentication;
5. pairing-attempt persistence and account admission;
6. analytics, conversion delivery, and background metadata synchronization.

Themes receive `window.PromotionBridge`. They never construct an endpoint,
select a protocol, read a status token, or persist a phone number.

## Build flow

```text
runtime TypeScript ──bundle──> account-link-elements.js ──pin──> control plane
contract schemas ─────copy───> versioned JSON schemas ────────> uploader/CI
theme source ──validate/build/pack──> deterministic ZIP ──────> template registry
```

`manifest.requirements.componentKit` tells the platform which pinned runtime to
inject. Runtime code is intentionally absent from the theme ZIP, so all visual
themes share one audited pairing implementation.

## Compatibility

- Patch releases may fix copy, accessibility, validation, or styling without
  changing the public state machine.
- Minor releases may add optional elements, parts, or manifest properties.
- Breaking runtime, bridge, or manifest behavior receives a new contract name.
- A theme ZIP declares the versions it requires and is rejected when the
  target platform cannot provide them.
