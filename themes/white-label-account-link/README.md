# White-label account-link capability

This is the default capability-only theme. It intentionally contains no logo,
campaign copy, background media, music, or opinionated visual identity.

Keep the standard element tags in `index.html`. Customize tokens and exposed
`::part()` selectors in `assets/theme.css`. The platform injects the component
runtime declared by `requirements.componentKit`.

Locale files provide page-level theme copy. Functional states and official
phone-linking guidance are supplied by the shared component runtime and may be
overridden through platform-provided localized copy when required.
