# Creating a theme

Copy `examples/minimal-theme` or `themes/white-label-account-link`. Keep the
canonical element tree in `index.html` and change only layout, CSS variables,
`::part()` rules, bundled media, and customer-facing copy.

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

The platform injects the runtime for `account-link-elements/v1`. Do not add a
runtime `<script>` tag to a theme.

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
node packages/cli/src/index.mjs validate path/to/theme
node packages/cli/src/index.mjs build path/to/theme --out dist/themes/my-theme
node packages/cli/src/index.mjs pack dist/themes/my-theme --out dist/themes/my-theme.zip
```

Validation checks the manifest Schema, required components, locale coverage,
file limits, white-label output, external asset references, source maps, and
direct platform/gateway integration.
