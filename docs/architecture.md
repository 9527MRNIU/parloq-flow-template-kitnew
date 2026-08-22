# Architecture and ownership

## Repository boundary

This repository publishes two sibling artifact classes whose names match the
mother project:

1. `PromotionTemplate`: static landing-page presentation, assets and localized
   copy composed around the platform account-link elements.
2. `PromotionIntegration`: managed script or iframe behavior packaged as a ZIP
   and attached to templates by the control plane.

It also owns the portable contract types, JSON Schemas, validators, deterministic
packaging, reference bundles and authoring guidance for those artifacts.
`artifacts/catalog.json` owns each downloadable package's permanent four-digit
sequence; build filenames derive their version from the package manifest.

The control plane remains authoritative for channel/domain resolution,
protocol-node routing, account assignment, pairing authentication, integration
source-domain validation, injection order, iframe session issuance, analytics
persistence and account storage.

Templates receive `window.PromotionBridge`. They never construct an endpoint,
select a protocol, read a status token, or persist a phone number. Feedback-
enabled iframes receive `window.PromotionIntegrationBridge`; they report only
events declared in `integration.json` and do not read or message the parent
template.

## Build flow

```text
account-link runtime ──bundle into template────> template ZIP
contract schemas ──────copy/pin────────────────> uploader and CI
template source ───────validate/build/pack─────> template registry
integration source ────validate/pack───────────> integration registry
```

`manifest.components.entry` identifies the compiled account-link runtime
inside each v3 template ZIP. The source remains shared in this repository, but
every released template is self-contained and deterministic.

An integration ZIP may contain either ordered `.js`/`.mjs` entries or one iframe
HTML entry with relative assets. The platform hosts those assets on the verified
source domain and injects scripts before iframes. Authentication and feedback
transport stay in the platform-injected iframe bridge, not in the ZIP.

## Compatibility

- Patch releases may fix copy, accessibility, validation or styling without
  changing a public state machine.
- Minor releases may add optional manifest properties or bridge fields.
- Breaking template, integration, bridge or runtime behavior receives a new
  contract version.
- Existing command names and template aliases remain available during the
  transition from the template-only kit to the promotion kit.
- The control plane rejects bundles that require unsupported contract versions.
