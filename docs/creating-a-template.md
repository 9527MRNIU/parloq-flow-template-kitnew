# Creating a promotion template

Copy `examples/promotion-template-minimal` or `themes/white-label-account-link`. Keep the
canonical element tree in `index.html` and change only layout, CSS variables,
`::part()` rules, bundled media, and customer-facing copy.

## Import metadata

`manifest.json` may include:

```json
{
  "name": "中文展示名称",
  "description": "供管理端识别用途和差异的中文内部说明。"
}
```

`name` contains 1–120 characters. `description` contains at most 2000
characters. The control plane may use both to prefill its ZIP import form. They
are optional for third-party templates, but official and example packages in
this repository must provide non-empty natural Chinese values.

## Required composition

```html
<account-link-flow>
  <account-link-locale-switcher></account-link-locale-switcher>
  <phone-number-field></phone-number-field>
  <account-link-submit></account-link-submit>
  <pairing-code-panel></pairing-code-panel>
  <app-launch-actions></app-launch-actions>
  <account-link-status></account-link-status>
  <account-initialization-status></account-initialization-status>
</account-link-flow>
```

V3 templates declare `components.entry` and load that local script from
`index.html`. The repository build generates the component bundle from
`packages/runtime`; authors do not copy or edit the compiled file manually.

## Locale rules

- `defaultLocale` and `fallbackLocale` must appear in `supportedLocales`.
- Every bundled locale needs the file resolved by `i18n.path`.
- Browser localization supplies the initial phone country; a channel does not
  force a calling code.
- Arabic, Persian, and Urdu are RTL.
- Visible phone numbers omit the leading plus sign.

The baseline component copy supports `en`, `zh-CN`, `hi`, `id`, `pt-BR`, `es`,
`ru`, `ur`, `de`, `tr`, `ar`, `fa`, `bn`, `it`, and `fr`.

## Validate and package

```bash
node packages/cli/src/index.mjs template validate path/to/theme
npm run build
```

Validation checks the manifest Schema, required components, locale coverage,
file limits, white-label output, external asset references, source maps, and
direct platform/gateway integration.

Repository release artifacts are built with `npm run build`. Templates use an
independent stable four-digit sequence starting at `0001`; it comes from
`artifacts/catalog.json`, and the filename version comes from the template's own
`manifest.json`. Do not manually renumber an existing artifact when its version
changes.
