# Goya reference storefront completion

The Goya storefront follows measured desktop/mobile shell, catalogue, service and editorial structures from Santoni's public shopping experience. It retains Goya's name, content, photographs, shared vector wordmark and installable PWA. This does not claim complete visual or functional equivalence: Avus Pro remains pending an appropriate licence, and some commercial-provider features remain outside the demo. See [font licensing](FONT-LICENSING.md).

## Implemented journeys

- A promotion strip, seven main menus, desktop groups and a three-level mobile menu. Men and women have shoe families, accessory families and curated editorial selections.
- Four homepage destinations (men new in, men accessories, women new in, women accessories), a genuine product carousel and thirteen original bilingual journal stories.
- Twenty-five seeded Goya listings using actual supplied or historical Goya photographs, with distinct new-in, gifting and featured memberships, audience-aware accessories, materials/colours/sizes/construction filters and custom sorting. Related colour choices switch between separate real demo SKUs and stocks.
- Measured four-column desktop/two-column mobile catalogue layouts, square product media, alternate supplied photographs on hover, load-more pagination, horizontal wishlist rows and a nonmodal empty-bag popover. PDP galleries support desktop dragging, mobile vertical scrolling, zoom and mobile information drawers; available angles are shown honestly.
- A right-side size picker, conversion chart, two-step fit questionnaire and unavailable-size request form. Recommendations check real demo sizes/stock; conversions are illustrative and have not been verified by Goya.
- Search with inventory-derived style suggestions, a default product carousel, typed suggestions, no-results state and a full results page. English/French search remains available, with selected-language metadata matching for translated seeded content. The reference-style overlay does not show a recent-search list.
- Seven interface languages: English, French, Italian, German, Spanish, Japanese and Arabic. Country selection covers 100 countries plus International and maps to 12 illustrative demo currencies. Original catalogue/editorial content and the admin editor use English/French; newly entered admin text and uploads are not automatically translated into the other five languages.
- Guest and customer checkout, addresses, billing, gift options, simulated approval/decline, card/wallet/MoMo and demo PayPal/Klarna/Scalapay presentations. Installment options vary by demonstration market. No payment provider is contacted and no credit is issued.
- Order lookup with an exact order reference and checkout email, private order histories, item-level returns, owner review, receipt and simulated refunds. Inventory is restored once on receipt; refunds never transfer money.
- Current-password-protected email/password edits, session revocation and single-use, expiring demo recovery. Recovery links are shown only when the browser has proof from a previous successful account authentication. No reset email is sent.
- Four distinct personalization editorial journeys: bespoke, made to order, on-time personalization and caring. Their consultation routes can collect a demonstration brief, including optional care photos; on-time also links to an eligible product listing. These are demonstration proposals, not claims that Goya currently operates every Santoni service.
- Online/boutique consultation requests, city-based store finder/maps, store detail pages, country/language/currency selection, contact/newsletter/careers forms and private request tracking.
- Admin management of enquiries, availability alerts, return stages, responses, catalogue imagery, inventory and merchandising metadata.
- Separate demonstration legal/support pages, detailed footer links, verified brand social links, working preference controls and optional newsletter invitations.

Requests, orders and inventory share the backend. Customer records and attachments remain restricted to their owner session or an administrator. Attachments are fetched on demand instead of included in routine catalogue polling.

Contact, newsletter and availability submissions create private persistent backend records; they are not local-only previews. Demo password recovery changes a password only after previously issued browser proof authorizes a single-use, expiring reset. No recovery or service email is sent.

## Brand and content boundaries

Store maps point to illustrative city centres in Cotonou, Paris and Dakar. Street addresses, phone numbers and operating hours were not invented. Consultation requests do not create real video calls, physical appointments, shipments or email messages. The 2020 Goya × Funkè story is historical and cites [MC&CO](https://www.mcandco.agency/fr/work/funke/).

The application does not claim access to Santoni's private order-management systems, authenticated account data or commercial provider contracts. No Santoni logo, campaign text or proprietary font was copied into Goya content. The current interface uses the licensed bundled fallback described in [font licensing](FONT-LICENSING.md).

The reference's populated bag could not be exercised during the fresh audit: its size-variation request removed the purchase control. Populated Goya bag layouts therefore follow the reference's public stylesheet, without a claim of a complete live populated-bag comparison. Goya retains working quantities, removal confirmation, move to wishlist, totals and checkout. Its promo panel validates demo code `GOYA10` against the backend quote, supports invalid-code feedback and removal, and carries the product discount into checkout, saved orders and invoices. PayPal/Apple Pay bag actions preselect demo checkout; no live wallet provider is contacted. These additions await final regression verification.

## Archive photographs

`public/images/archive/goya-01.jpg` through `goya-22.jpg` are unmodified photographs from the historical article [Des souliers Goya Paris](https://www.africafashioncode.net/des-souliers-goya-paris/), published in November 2020. Prices, product names, selected edits and availability in this application are illustrative demo data. Matching accessories shown together are described as separate listings. The image files have not been used to claim current stock or a current commercial partnership.

All source images use the article's `/wp-content/uploads/2020/11/` directory. File correspondence, in numeric order:

1. `1573170636-1024x858.jpg`
2. `1702688480-1-1024x741.jpg`
3. `231794587-1024x1024.jpg`
4. `1924076184-1-1024x1024.jpg`
5. `1959949920-1024x1021.jpg`
6. `1771588781-820x1024.jpg`
7. `1427717349-1024x1024.jpg`
8. `1637294031-1024x1024.jpg`
9. `1678831505-819x1024.jpg`
10. `2080377062-1024x1024.jpg`
11. `1263451983-1024x1024.jpg`
12. `261997886-1-1024x1024.jpg`
13. `1959949920-1-1024x1021.jpg`
14. `1567373075-819x1024.jpg`
15. `986256459-1024x1024.jpg`
16. `1637294031-1-1024x1024.jpg`
17. `goya-592x296-1537451919.jpg`
18. `Goya-3.jpg`
19. `202616392-819x1024.jpg`
20. `263077815-1-1024x1024.jpg`
21. `154049827-2-1024x1024.jpg`
22. `1211501004-2-1001x1024.jpg`

Existing uploaded images, product edits, prices, stock, accounts and orders are retained. Reconciliation adds missing archive demo listings without resetting an existing listing.

## Verification

The current reference comparison includes desktop/mobile navigation, catalogue/filter/sort states, search states, PDP gallery/detail drawers, available and unavailable sizes, conversion chart, fit questions, wishlist and empty bag. The populated reference bag limitation is described above. Saved reference evidence is kept in the ignored `.data/exact-reference/` directory.

Run the repository's lint, type, unit, asset, production-build and browser checks for the final state; this document does not assert new build or E2E results before those checks finish. Browser coverage includes guest/customer shopping, simulated payment, account recovery, private requests, returns/refunds and consultation journeys. Automated writes must use isolated local demo data with an empty `DATABASE_URL`; hosted verification remains read-only.
