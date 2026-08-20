# Promotion artifact examples

Example directories follow the mother project's public model names:

- `promotion-template-*` contains landing-page template sources;
- `promotion-integration-*` contains managed script or iframe integration
  sources.

Each directory is independently validatable and packageable. Author-only
`README.md` files are excluded from generated ZIPs.

Official downloadable packages are assigned permanent sequences in
`artifacts/catalog.json`. Existing sequences never change; new packages take
the next number. Every example manifest provides English JSON field names with
a natural Chinese `name` and `description`; integrations also provide a
lowercase machine-readable `integrationKey`.

The integration examples intentionally cover three distinct package modes:

- `promotion-integration-script-demo`: ordered classic and module scripts;
- `promotion-integration-iframe-demo`: a standalone iframe without feedback;
- `promotion-integration-feedback-demo`: an iframe using the optional event
  feedback bridge.
