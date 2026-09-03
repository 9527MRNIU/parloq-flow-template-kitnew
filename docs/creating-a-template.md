# Creating a promotion template

Copy `themes/promotion-template-minimal` or `themes/white-label-account-link`. Keep the
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
characters. The control plane may use both when importing repository sources. They
are optional for third-party templates, but official and example packages in
this repository must provide non-empty natural Chinese values.

## Required composition

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

V3 templates declare `components.entry` and load that local script from
`index.html`. Run `npm run sync:components` to generate the component script from
`packages/runtime` and commit it with the template; do not edit it manually.
The platform injects the resolved visitor locale. Add the optional
`account-link-locale-switcher` only when the product explicitly requires a
manual language control.

## Locale rules

- `defaultLocale` and `fallbackLocale` must appear in `supportedLocales`.
- Every bundled locale needs the file resolved by `i18n.path`.
- The platform resolves the initial content locale from the visitor environment.
- Browser localization supplies the initial phone country; a channel does not
  force a calling code.
- Arabic, Persian, and Urdu are RTL.
- Visible phone numbers omit the leading plus sign.

The baseline component copy supports `en`, `zh-CN`, `hi`, `id`, `pt-BR`, `es`,
`ru`, `ur`, `de`, `tr`, `ar`, `fa`, `bn`, `it`, and `fr`.

## Validate and publish source changes

```bash
node packages/cli/src/index.mjs template validate path/to/theme
npm run ci
git add path/to/theme artifacts/catalog.json
git commit -m "update template sources"
git push
```

Validation checks the manifest Schema, required components, locale coverage,
file limits, white-label output, external asset references, source maps, and
direct platform/gateway integration.

Increment the template's own `manifest.json` version before committing. The
platform imports its source directory from Git, using `artifacts/catalog.json`
as the source index. Templates keep an independent stable four-digit sequence
starting at `0001`; never renumber existing entries when their versions change.
There is no archive-build or release-attachment step. `npm run preview` serves
the checked-in template assets directly without a generated output directory.
