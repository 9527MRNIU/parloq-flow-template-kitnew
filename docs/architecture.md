# Architecture and ownership

## Repository boundary

This repository maintains two sibling source classes whose names match the
mother project:

1. `PromotionTemplate`: static landing-page presentation, assets and localized
   copy composed around the platform account-link elements.
2. `PromotionIntegration`: managed browser behavior imported from Git and
   attached to templates by the control plane.

It also owns portable contract types, JSON Schemas, source validators, reference
templates and authoring guidance. `artifacts/catalog.json` retains each source's permanent four-digit
sequence. Templates and integrations have independent sequences, each starting
at `0001`; each source manifest owns its version. The catalog remains compatible
with platform repository imports and is not a download manifest.

The control plane remains authoritative for channel/domain resolution,
protocol-node routing, account assignment, pairing authentication, integration
source-domain validation, injection order, iframe session issuance, analytics
persistence and account storage.

Templates receive `window.PromotionBridge`. They never construct an endpoint,
select a protocol, read a status token, or persist a phone number. Feedback-
enabled iframes receive `window.PromotionIntegrationBridge`; they report only
events declared in `integration.json` and do not read or message the parent
template.

## Source update flow

```text
account-link runtime ──sync:components────────> checked-in template assets
template source ───────source checks + tests──> commit and push
integration source ────manifest version───────> commit and push
Git source + catalog ──platform import────────> template/integration registry
```

`manifest.components.entry` identifies the compiled account-link runtime
inside each v3 template source directory. The runtime source remains shared;
each template commits its own compiled script and stays self-contained.

The platform imports integration source, validates its declared contract, and
hosts its assets on the verified source domain. Authentication and feedback
transport stay in the platform-injected bridge, not in integration source.

CI runs source checks and tests only. Local preview reads template sources
directly. Neither operation packages sources or reads managed integration
manifests. The v1 integration validator remains available for compatibility
examples; it is not a publication gate for newer platform integration types.

## Compatibility

- Patch releases may fix copy, accessibility, validation or styling without
  changing a public state machine.
- Minor releases may add optional manifest properties or bridge fields.
- Breaking template, integration, bridge or runtime behavior receives a new
  contract version.
- The legacy template validation alias remains available. Archive build and
  publication commands have been retired; publish source changes through Git.
- The control plane rejects bundles that require unsupported contract versions.
