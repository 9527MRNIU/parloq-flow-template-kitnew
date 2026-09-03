# White-label account-link capability

This is the default capability-only theme. It intentionally contains no logo,
campaign copy, background media, music, or opinionated visual identity.

Keep the standard element tags in `index.html`. Customize tokens and exposed
`::part()` selectors in `assets/theme.css`. Run `npm run sync:components` to
maintain `assets/account-link-elements.js` from the shared component source
and commit the generated script with the template.

Locale files provide page-level theme copy. Functional states and official
phone-linking guidance are supplied by the bundled component runtime and may be
overridden through platform-provided localized copy when required.

Source catalog sequence `0001` is permanent. Update `manifest.json.version`,
run `npm run ci`, then commit and push the source changes. Use `npm run preview`
for local preview; no download-build step is needed.
