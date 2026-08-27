# MTG set collections (Card Singles grid)

One smart collection per release, matching on the Mana Pool sync metafield
`mana_pool.set_code` (definition `gid://shopify/MetafieldDefinition/131219161282`),
rules OR'd together so a set's main code, Commander code and bonus-sheet code all land in
one tile. Sort order Best selling, published to Online Store + Shop.

Thumbnails are Scryfall `art_crop` images of an iconic card from that set. Shopify fetches
them server-side and rehosts them on its own CDN, and the grid's collection card is set to
`image_ratio: square`, so they render as 1:1 tiles.

Grid order below is the order in `templates/collection.mtg-singles-top.json`, newest
release first. Counts are as of 2026-08-27.

| Release | Set codes | Handle | Count | Art |
| --- | --- | --- | ---: | --- |
| Teenage Mutant Ninja Turtles | TMT / TMC | `teenage-mutant-ninja-turtles-tmt` | 42 | Raph & Leo, Sibling Rivals |
| The Hobbit | HOB / HOC | `the-hobbit-hob` | 106 | Desolation of Smaug |
| Marvel Super Heroes | MSH / MSC | `marvel-super-heroes-msh` | 329 | Thanos, the Mad Titan |
| Secrets of Strixhaven | SOS / SOC / SOA | `secrets-of-strixhaven-sos` | 64 | Quandrix, the Proof |
| Lorwyn Eclipsed | ECL | `lorwyn-eclipsed-ecl` | 73 | Oko, Lorwyn Liege |
| Avatar: The Last Airbender | TLA / TLE | `card-singles-copy` | 56 | pre-existing |
| Marvel's Spider-Man | SPM / SPE / MAR | `marvels-spider-man` | 17 | pre-existing |
| Edge of Eternities | EOE / EOC / EOS | `edge-of-eternities-eoe` | 42 | Tezzeret, Cruel Captain |
| Final Fantasy | FIN / FIC / FCA | `outlaws-of-thunder-junction-otj-otc-otp-big-copy-1` | 103 | pre-existing |
| Tarkir: Dragonstorm | TDM / TDC | `tarkir-dragonstorm-tdm` | 93 | Sarkhan, Dragon Ascendant |
| Aetherdrift | DFT / DRC | `aetherdrift-dft` | 34 | Ketramose, the New Dawn |
| Innistrad Remastered | INR | `fallout-pip-copy` | 10 | pre-existing |
| Foundations | FDN / FDC / J25 | `foundations-fdn` | 155 | Omniscience |
| Duskmourn: House of Horror | DSK / DSC | `duskmourn-house-of-horror-dsk` | 77 | Valgavoth, Terror Eater |
| Bloomburrow | BLB / BLC | `outlaws-of-thunder-junction-otj-otc-otp-big-copy` | 162 | pre-existing |
| Mystery Booster 2 | MB2 | `mystery-booster-2-mb2` | 90 | Ball Lightning |
| Assassin's Creed | ACR | `assassins-creed-acr` | 0 | Ezio Auditore da Firenze |
| Modern Horizons 3 | MH3 / M3C | `modern-horizons-3-mh3` | 36 | Phlage, Titan of Fire's Fury |
| Outlaws of Thunder Junction | OTJ / OTC / OTP / BIG | `outlaws-of-thunder-junction-otj-otc-otp-big` | 0 | pre-existing |
| Fallout | PIP | `avatar-the-last-airbender-tla-tle-copy` | 25 | pre-existing |
| Murders at Karlov Manor | MKM / MKC / CLU | `murders-at-karlov-manor-mkm` | 0 | Alquist Proft, Master Sleuth |
| Ravnica Remastered | RVR | `ravnica-remastered-rvr` | 1 | Steam Vents |
| The Lost Caverns of Ixalan | LCI / LCC / REX | `lost-caverns-of-ixalan-lci` | 4 | Cavern of Souls |
| Doctor Who | WHO | `doctor-who-who` | 1 | The Tenth Doctor |
| Wilds of Eldraine | WOE / WOC / WOT | `wilds-of-eldraine-woe` | 0 | Beseech the Mirror |
| Commander Masters | CMM | `commander-masters-cmm` | 211 | Rorix Bladewing |
| The Lord of the Rings | LTR / LTC | `lord-of-the-rings-tales-of-middle-earth-ltr` | 41 | The One Ring |
| Phyrexia: All Will Be One | ONE / ONC | `innistrad-remastered-inr-copy` | 5 | pre-existing |
| Adventures in the Forgotten Realms | AFR / AFC | `adventures-in-the-forgotten-realms-afr` | 4 | pre-existing |

Four sets currently sit at 0 (ACR, OTJ, MKM, WOE) and their tiles are hidden by the
`hide_when_empty` setting until they restock. See `hide-empty-set-tiles.md`.

## Discovering set codes

Mana Pool tags every single with its bare set code, so `productTags` enumerates every set
in the catalogue in two calls - far cheaper than paging 2,103 products:

```graphql
query { productTags(first: 250) { pageInfo { hasNextPage endCursor } nodes } }
```

Filter the result to 3-4 character uppercase codes (the list also holds vinyl grading tags
like `RE`, `RM`, `Bla`, `Etch`), then identify each with a sample title and get a count:

```graphql
query {
  sample: products(first: 5, query: "tag:'SOS'") { nodes { title } }
  count: productsCount(query: "tag:'SOS'") { count }
}
```

That is how `SOS` was identified as Secrets of Strixhaven (Quandrix and Silverquill cards)
and `MSC` as Marvel Super Heroes Commander rather than March of the Machine Commander.
Tag values and `mana_pool.set_code` values agree; the collections use the metafield.

## Fixed along the way

`Adventures in the Forgotten Realms (AFR)` was matching on the tag
`"Adventures in the Forgotten Realms"`, which no product carries - the real tag is `AFR`.
It showed 0 products despite 4 being in stock. It now matches `set_code` in `AFR`/`AFC`
like every other set collection.

## Adding a set

```graphql
mutation($i: CollectionInput!) { collectionCreate(input: $i) { collection { id } userErrors { message } } }
```
```json
{ "i": {
  "title": "Duskmourn: House of Horror (DSK / DSC)",
  "handle": "duskmourn-house-of-horror-dsk",
  "sortOrder": "BEST_SELLING",
  "image": { "src": "https://api.scryfall.com/cards/named?exact=Valgavoth%2C%20Terror%20Eater&set=dsk&format=image&version=art_crop" },
  "ruleSet": { "appliedDisjunctively": true, "rules": [
    { "column": "PRODUCT_METAFIELD_DEFINITION", "relation": "EQUALS", "condition": "DSK",
      "conditionObjectId": "gid://shopify/MetafieldDefinition/131219161282" }
  ]}
}}
```

Then `publishablePublish` it to Online Store (`140779913410`) and Shop (`140780011714`),
and add the handle to `collection_list` in `templates/collection.mtg-singles-top.json`.

The `cards/named?exact=<name>&set=<code>&format=image&version=art_crop` URL is stable and
`&set=` pins the printing so the art comes from the right set. If the name is wrong for
that set, Shopify fails the upload with `file not found` rather than silently using the
wrong art - a free correctness check. (That caught "Loot, Exuberant Explorer", which is
not an Aetherdrift card.)

## Not covered

Roughly 1,780 of the 2,103 singles now sit in a set tile, up from about 860. The rest are
mostly reprint pools and pre-2023 sets with thin stock: The List (`PLST`, 159), Innistrad
Double Feature (`DBL`, 31), Secret Lair (`SLD`, 18), Dominaria United (`DMU`, 14), March
of the Machine (`MOM`, 12), Modern Horizons 2 (`MH2`, 10), and a long tail in single
digits. Special Guests (`SPG`, 7) and `PF26` (3) are promo inserts rather than releases.
