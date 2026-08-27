# MTG set collections (Card Singles grid)

Smart collections, one per release, matching on the Mana Pool sync metafield
`mana_pool.set_code` (definition `gid://shopify/MetafieldDefinition/131219161282`),
rules combined with OR so a set's main code, Commander code and bonus-sheet code all
land in one tile. Sort order: Best selling. Published to Online Store + Shop.

Thumbnails are Scryfall `art_crop` images of an iconic card from that set, fetched
server-side by Shopify and rehosted on the Shopify CDN. The grid's collection card is
already configured with `image_ratio: square`, so they render as 1:1 tiles.

Listed newest release first - this is a sensible order for the section's collection picker.

| Release | Set codes | Handle | Art | Status |
| --- | --- | --- | --- | --- |
| Avatar: The Last Airbender | TLA / TLE | `card-singles-copy` | existing | existing |
| Marvel's Spider-Man | SPM / SPE / MAR | `marvels-spider-man` | existing | existing |
| Edge of Eternities | EOE / EOC / EOS | `edge-of-eternities-eoe` | Tezzeret, Cruel Captain | **new** |
| Final Fantasy | FIN / FIC / FCA | `outlaws-of-thunder-junction-otj-otc-otp-big-copy-1` | existing | existing |
| Tarkir: Dragonstorm | TDM / TDC | `tarkir-dragonstorm-tdm` | Sarkhan, Dragon Ascendant | **new** |
| Aetherdrift | DFT / DRC | `aetherdrift-dft` | Ketramose, the New Dawn | **new** |
| Innistrad Remastered | INR | `fallout-pip-copy` | existing | existing |
| Foundations | FDN / FDC / J25 | `foundations-fdn` | Omniscience | **new** |
| Duskmourn: House of Horror | DSK / DSC | `duskmourn-house-of-horror-dsk` | Valgavoth, Terror Eater | **new** |
| Bloomburrow | BLB / BLC | `outlaws-of-thunder-junction-otj-otc-otp-big-copy` | existing | existing |
| Assassin's Creed | ACR | `assassins-creed-acr` | Ezio Auditore da Firenze | **new** |
| Modern Horizons 3 | MH3 / M3C | `modern-horizons-3-mh3` | Phlage, Titan of Fire's Fury | **new** |
| Outlaws of Thunder Junction | OTJ / OTC / OTP / BIG | `outlaws-of-thunder-junction-otj-otc-otp-big` | existing | existing |
| Fallout | PIP | `avatar-the-last-airbender-tla-tle-copy` | existing | existing |
| Murders at Karlov Manor | MKM / MKC / CLU | `murders-at-karlov-manor-mkm` | Alquist Proft, Master Sleuth | **new** |
| Ravnica Remastered | RVR | `ravnica-remastered-rvr` | Steam Vents | **new** |
| The Lost Caverns of Ixalan | LCI / LCC / REX | `lost-caverns-of-ixalan-lci` | Cavern of Souls | **new** |
| Doctor Who | WHO | `doctor-who-who` | The Tenth Doctor | **new** |
| Wilds of Eldraine | WOE / WOC / WOT | `wilds-of-eldraine-woe` | Beseech the Mirror | **new** |
| The Lord of the Rings | LTR / LTC | `lord-of-the-rings-tales-of-middle-earth-ltr` | The One Ring | **new** |
| Phyrexia: All Will Be One | ONE / ONC | `innistrad-remastered-inr-copy` | existing | existing (pre-2023) |
| Adventures in the Forgotten Realms | AFR | `adventures-in-the-forgotten-realms-afr` | existing | existing (pre-2023) |

Note: several existing collections have handles left over from being duplicated
(Bloomburrow lives at `outlaws-of-thunder-junction-...-copy`, Fallout at
`avatar-the-last-airbender-...-copy`, and so on). Renaming those handles would change
their public URLs, so they were left alone.

## Recreating one of these

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

The `cards/named?exact=<name>&set=<code>&format=image&version=art_crop` URL is stable and
pins the printing, so the art comes from the right set. If the card name is wrong for that
set Shopify returns `Image upload failed ... file not found` rather than silently using the
wrong art - a useful check when adding a set.
