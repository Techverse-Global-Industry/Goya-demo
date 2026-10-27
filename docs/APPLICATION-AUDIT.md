# Application audit and official brand update

This update combines the supplied Goya artwork with fixes found across public shopping, customer accounts, services and administration. All browser writes use an isolated local demo database; hosted checks are read-only.

## Corrected behaviour

- Favourites are recorded in an owner-bound local outbox before saving. Additions and removals survive failed requests and reloads; serialized writes and server revisions prevent a closing page from overwriting a newer save.
- Product validation rejects one-size stock for footwear and belts while retaining legitimate one-size accessories.
- Reopening a closed consultation checks the slot again before changing the record, preventing double booking.
- Availability requests submitted after a restock resolve immediately. Newly created service, restock and return notifications are scheduled through the existing opt-in push transport after the database change succeeds.
- Browser photo preparation and server validation share the exact 600,000-byte attachment limit.
- Search, recommendations and gallery controls use logical RTL positions. Gallery counters and thumbnails follow the visible photograph, and cancelled dragging no longer suppresses the next click.
- Contact country/language defaults follow restored preferences while preserving explicit customer selections during translation.
- Service history and order timeline dates use the selected interface language.
- Finishing an admin order update preserves a newer status selection made while the snapshot refresh is pending; duplicate submissions are blocked while saving.
- Temporary research and browser-report directories are excluded from TypeScript project scans; application and test sources remain checked.

## Official logo artwork

The wordmark, city signature and shoe emblem are supplied originals. Their copies in `public/brand/official/` match the source PNG bytes. Web copies remove only empty transparent margins; shared SVG masks preserve the actual lettering and support light and dark backgrounds. The footer, navigation, account/admin/loading/error surfaces, fallbacks, installation UI, favicon, app icons and offline screen use the appropriate variants. Icon URLs and the service-worker cache include the artwork version.

## Verification

- All 129 core regression tests pass, including ten new persistence and backend cases.
- Project-wide lint passes on 195 files, with the final timeline localization, admin status fix and its browser regression checked separately.
- The combined production build and strict TypeScript check pass; 117 pages are generated.
- The first full browser run passed 66 cases with three device-specific skips and exposed the admin status race above. After the fix, all four targeted desktop/mobile tests pass: the deterministic delayed-refresh regression and the complete publishing, demo MoMo checkout, fulfilment and customer-update journey on each device.
- All 27 official-brand layout checks pass across desktop, 393px mobile and 320px mobile, including French and Arabic reloads. Eleven served artwork/icon assets match the reviewed files, and the three original artwork copies match the supplied source hashes.
- The offline screen embeds the official artwork, the new service-worker cache is active, and private account/API responses are absent from that cache. No browser runtime errors were observed in the brand checks.
- All 11 original image slots and 22 Goya archive photographs are present.

Checkout and payment checks use simulations. No real payment, email, shipment or appointment is created by verification.
