# AI promotion-template generation prompt

Use this prompt as the fixed capability boundary when asking an AI design tool
to create a new visual theme:

```text
Create the presentation files for a static promotion-template/v3 landing-page
theme. Preserve the exact standard account-link custom-element composition
from examples/promotion-template-minimal/index.html. Change only surrounding semantic HTML,
CSS variables, ::part() styling, local relative media, and customer-facing
copy. The repository build bundles account-link-elements/v1 into the template
ZIP, while the platform exposes window.PromotionBridge; do not write direct
pairing requests, status polling,
authentication headers, API URLs, protocol IDs, analytics SDKs, or phone-number
persistence. Do not put the control-plane product name in the public bundle.
Keep every asset relative and local, support 360x800, 390x844, 768x1024, and
1440x900 without overflow, preserve keyboard/focus accessibility, and preserve
RTL layout. Visible phone numbers must not show a leading plus sign. Return a
manifest.json, index.html, assets/, and one JSON file for every declared locale.
For an official or example package, include a natural Chinese manifest `name`
and `description`; keep the JSON field names in English.
```

After generation, run the repository validator. AI output is not accepted by
visual inspection alone.
