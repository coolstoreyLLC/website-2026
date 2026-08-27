# Hiding set tiles that have no products

The Sets grid on `/collections/card-singles` is a `collection-list` section
(`collection_list_WA9Q9Q` in `templates/collection.mtg-singles-top.json`) with a
hand-picked list of collection handles. A set that is sold out still rendered a tile
linking to an empty page. This makes those tiles disappear on their own, and come back
on restock, with no manual toggling and no scheduled job.

Applied to the **unpublished** theme `CS Overhaul + set grid (hide empty sets)`
(`155599077570`), duplicated from the live theme. The live theme is untouched.

## Why the collection card, not the section

The obvious place is `sections/collection-list.liquid`, filtering the list before the
loop. That file is ~20 KB and mostly schema, and every byte has to be rewritten to change
one line. `blocks/_collection-card.liquid` is 4 KB and is rendered once per tile, so the
whole change fits there instead - a much smaller blast radius for the same result.

The catch is that the grid cell (`<div class="resource-list__item">`) is emitted by the
*section*, not the card, so the card can't remove its own cell by rendering nothing - that
leaves a gap in the grid. Instead the card emits a marker element and a `:has()` rule
collapses the cell from the inside.

## The change

`blocks/_collection-card.liquid`:

```liquid
{% liquid
  assign cs_hide_empty = false
  if block.settings.hide_when_empty and collection != blank and collection.all_products_count == 0
    assign cs_hide_empty = true
  endif
%}

{% style %}
  ...existing visual_preview_mode rule...
  .resource-list__item:has(.cs-collection-card--empty) {
    display: none;
  }
{% endstyle %}

{% if cs_hide_empty %}
  <span class="cs-collection-card--empty" hidden></span>
{% endif %}
```

plus a `hide_when_empty` checkbox in the block schema, defaulting to **false**.

`templates/collection.mtg-singles-top.json` sets `"hide_when_empty": true` on the Sets
grid's `static-collection-card` block, and nowhere else.

## Notes and limits

- **Opt-in.** Default `false` means every other collection list in the theme (homepage
  tiles, etc.) behaves exactly as before. The checkbox shows up in the theme editor on any
  collection card, so it can be turned on elsewhere later.
- **`:has()` support.** Chrome 105+, Safari 15.4+, Firefox 121+ - about 97% of traffic.
  On an older browser the tile is still hidden (the card renders, but an empty-collection
  tile is only ever a dead link) - what degrades is that the grid cell isn't collapsed, so
  a gap appears. Cosmetic, not broken.
- **The tile is hidden, not removed.** The markup for a hidden set still ships in the HTML
  and the link is still in the DOM. That is what "make invisible" asks for and it keeps the
  change to one small file; if the dead links ever matter for SEO, the filtering has to
  move up into `sections/collection-list.liquid`.
- **`all_products_count` counts products, not units.** The Mana Pool sync drops sold-out
  singles from the catalog, so the count falls to 0 on sell-out, which is the behaviour we
  want. If singles are ever left published at 0 inventory, the tile would stay visible;
  hiding those needs a per-product inventory check, which Liquid can't do cheaply here.
- **Carousel layouts.** The Sets grid is `layout_type: grid`, where the section emits
  `{{ list_items }}` directly, so `.resource-list__item` is the real grid cell. In a
  carousel layout the slide count would still include hidden tiles, leaving a blank slide.
  Don't turn `hide_when_empty` on for a carousel without revisiting this.
