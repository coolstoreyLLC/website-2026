# Cool Story — website-2026

Shopify theme source for coolstory.shop (Cool Story Games, Media, and Artifacts).
`theme-src/` holds only the files we customize; the rest of the theme is stock
Horizon living in the Shopify admin.

## Deploying to Shopify — hard rules

- **Never write to the live/MAIN theme.** Always duplicate the active theme
  (`themeDuplicate`), push files to the unpublished copy, and hand Simon the
  preview link. Activating a theme is always his manual step.
- Never publish a theme (`themePublish`) or delete one.
- Push with `themeFilesUpsert` against the duplicate's ID, then confirm the
  returned `size` matches the local file byte-for-byte.
- Preview URL shape: `https://coolstory.shop/?preview_theme_id=<theme id>`.

## Repo ↔ theme drift

The live theme can be edited in the admin, so it may be ahead of this repo.
Before overwriting any file, read the live copy (`theme { files { body } }`)
and diff it — that is how `{%- render 'mana-symbols' -%}` in
`layout/theme.liquid` was nearly lost.

## Horizon version updates (why 4.1.4 "lost all our fonts")

Investigated 2026-08-28 by diffing the live theme against Shopify's
"Updated copy of CS Overhaul…" (theme 155599536322). What a theme update
does, precisely:

- **Custom new files survive byte-for-byte**: `assets/cs-*`, `sections/cs-*`,
  `snippets/mana-symbols.liquid`, `rc-rocket.woff2`, `templates/index.json`.
- **Base files we override are replaced with stock.** `layout/theme.liquid`
  went 2,633 → 7,742 bytes of stock Horizon: no Google Fonts `<link>`, no
  `cs-tokens.css`, no `mana-symbols`. **That alone is the font loss** — the
  font files were all still there, just never referenced. Same fate awaits
  `snippets/product-card.liquid` (our foil hook) and whatever customization
  lives in `sections/main-collection.liquid`, which differs live vs. stock
  and is NOT in this repo — capture it before ever running an update.
- **Global settings are reset to stock defaults.** `config/settings_data.json`
  went 17,824 → 7,104 bytes: dark Heritage palette (`#202219` bg, cream fg),
  Instrument Sans / Saira type. 4.1.4 replaces the `color_schemes` model with
  a single `color_palette` (the layout renders `color-palette` in place of
  `color-schemes`), so the old schemes cannot be auto-migrated.

So restoring fonts after an update is ~10 lines in `layout/theme.liquid`, but
a full 4.1.4 migration is a real project: re-apply the layout hunks, rebuild
the color system in the new palette model, re-apply base-file overrides,
re-test. The update is optional — nothing breaks by staying put, and the
admin banner is a suggestion, not a requirement.

## Product data conventions

Singles sync from Mana Pool. Each carries exactly one printing tag —
`foil`, `etched` or `nonfoil` — plus the set code and `Magic: The Gathering`.
Match printing tags on whole tags (split the tag list); a substring `contains`
reads "nonfoil" as foil.

## Network in Claude Code sessions

Remote sessions cannot reach `coolstory.shop` or `cdn.shopify.com` (egress
policy), so the storefront cannot be screenshotted from here. Verify front-end
work in a local Playwright harness that mimics the theme's DOM.
