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

## Horizon version updates (the font trap)

A Shopify theme update replaces base theme files with stock ones. Custom
*new* files (`assets/cs-*`, `sections/cs-*`, `rc-rocket.woff2`) carry over
untouched, but **`layout/theme.liquid` gets overwritten** — and that file is
where the Google Fonts `<link>`, `cs-tokens.css`, `cs-foil.css` and
`mana-symbols` are wired in. That is why the 4.1.4 update appeared to "lose
all our fonts". Any base file we override (currently
`snippets/product-card.liquid`) is overwritten the same way. After an update,
re-apply those hunks to the updated copy's `layout/theme.liquid` before
judging the result.

## Product data conventions

Singles sync from Mana Pool. Each carries exactly one printing tag —
`foil`, `etched` or `nonfoil` — plus the set code and `Magic: The Gathering`.
Match printing tags on whole tags (split the tag list); a substring `contains`
reads "nonfoil" as foil.

## Network in Claude Code sessions

Remote sessions cannot reach `coolstory.shop` or `cdn.shopify.com` (egress
policy), so the storefront cannot be screenshotted from here. Verify front-end
work in a local Playwright harness that mimics the theme's DOM.
