# Hide empty collections in the "Sets" grid

Adds an opt-in **"Hide collections with no products"** toggle to the `collection-list`
section, so set tiles on `/collections/card-singles` disappear while a set is sold out
and come back automatically on restock.

- **File to edit:** `sections/collection-list.liquid` (live theme: *CS Overhaul + mana pips*)
- **Where the toggle appears:** Theme editor -> Sets section -> below the collection picker
- **Default:** off, so every other `collection-list` section in the theme is unaffected.

The check is driven by `collection.all_products_count`, which Shopify recalculates as the
Mana Pool sync adds and removes products. No manual toggling, no scheduled job.

---

## Hunk A - skip empty collections while building the tiles

Replace the `{% capture list_items %}` block:

```diff
+  {% assign rendered_count = 0 %}
   {% capture list_items %}
     {% for collection in section_collections limit: max_items %}
+      {% if section.settings.hide_empty_collections and collection.all_products_count == 0 %}
+        {% continue %}
+      {% endif %}
+      {% if rendered_count > 0 %}
+        <!--@list/split-->
+      {% endif %}
       <div class="resource-list__item">
         {% content_for 'block', type: '_collection-card', id: 'static-collection-card', closest.collection: collection %}
       </div>
-      {% unless forloop.last %}
-        <!--@list/split-->
-      {% endunless %}
+      {% assign rendered_count = rendered_count | plus: 1 %}
     {% endfor %}
   {% endcapture %}
```

The separator moves from "after every item except the last" to "before every item except
the first". That is equivalent for a full list, but unlike `forloop.last` it stays correct
when items are skipped - otherwise a trailing separator would leave a phantom empty tile.

## Hunk B - keep the carousel slide count honest

```diff
   {% render 'resource-list',
     list_items: list_items,
     list_items_array: list_items_array,
     settings: section.settings,
     carousel_ref: 'collectionList',
-    slide_count: max_items,
+    slide_count: rendered_count,
     content_type: 'collections',
     test_id: 'collections-list-grid'
   %}
```

`max_items` counts every picked collection, including the hidden ones. `rendered_count`
counts what was actually output.

## Hunk C - add the setting

In `{% schema %}`, directly after the existing `collection_list` setting:

```diff
     {
       "type": "collection_list",
       "id": "collection_list",
       "label": "t:settings.collection_list"
     },
+    {
+      "type": "checkbox",
+      "id": "hide_empty_collections",
+      "label": "Hide collections with no products",
+      "info": "Tiles for collections with 0 products are hidden automatically, and reappear when the set restocks.",
+      "default": false
+    },
```

---

## Notes

- `assign` inside `{% capture %}` persists after the capture, so `rendered_count` is
  readable by the `resource-list` render below it.
- Placeholder tiles in the theme editor (when no collections are picked yet) are strings,
  not collections, so `all_products_count` is `nil`, `nil == 0` is false, and they still
  render. The editor preview is unaffected.
- `all_products_count` counts *products in the collection*, not units in stock. The Mana
  Pool sync drops sold-out singles from the catalog, so the count falls to 0 on sell-out -
  which is the behaviour we want. If singles are ever kept published at 0 inventory, this
  toggle would keep showing the tile; hiding those needs a per-product inventory check
  instead, which Liquid can't do cheaply on a collection list.
