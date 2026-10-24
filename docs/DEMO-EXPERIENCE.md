# Goya reference storefront completion

This release expands the Santoni-inspired Goya presentation and customer journeys. The public US shopping experience was the purchase-enabled reference. Goya retains its own name, copy, photographs, French/English translations, supported markets and installable PWA.

## Implemented journeys

- A promotion strip, seven main menus, desktop groups and a three-level mobile menu. Men and women have shoe families, accessory families and curated editorial selections.
- Four homepage destinations (men new in, men accessories, women new in, women accessories), a genuine product carousel and thirteen original bilingual journal stories.
- Distinct new-in, gifting and featured memberships, audience-aware accessories, materials/colours/sizes/construction filters, actual related colour SKUs, product zoom and availability requests.
- A conversion chart and illustrative fit questionnaire. Recommendations check real demo sizes/stock; the chart is not a measurement system verified by Goya.
- Ranked bilingual search, inventory-derived style suggestions and optional recent searches. Recent searches persist only when experience preferences are enabled.
- Guest and customer checkout, addresses, billing, gift options, simulated approval/decline, card/wallet/MoMo and demo PayPal/Klarna/Scalapay presentations. Installment options vary by demonstration market. No payment provider is contacted and no credit is issued.
- Order lookup with an exact order reference and checkout email, private order histories, item-level returns, owner review, receipt and simulated refunds. Inventory is restored once on receipt; refunds never transfer money.
- Current-password-protected email/password edits, session revocation and single-use, expiring demo recovery. Recovery links are shown only when the browser has proof from a previous successful account authentication. No reset email is sent.
- Four distinct personalization journeys: bespoke enquiry, made-to-order configuration, initial personalization and care/restoration assessment with optional photos. These are demonstration proposals, not claims that Goya currently operates every Santoni service.
- Online/boutique consultation requests, city-based store finder/maps, store detail pages, country/language/currency selection, contact/newsletter/careers forms and private request tracking.
- Admin management of enquiries, availability alerts, return stages, responses, catalogue imagery, inventory and merchandising metadata.
- Separate demonstration legal/support pages, detailed footer links, verified brand social links, working preference controls and optional newsletter invitations.

Requests, orders and inventory share the backend. Customer records and attachments remain restricted to their owner session or an administrator. Attachments are fetched on demand instead of included in routine catalogue polling.

## Brand and content boundaries

Store maps point to illustrative city centres in Cotonou, Paris and Dakar. Street addresses, phone numbers and operating hours were not invented. Consultation requests do not create real video calls, physical appointments, shipments or email messages. The 2020 Goya × Funkè story is historical and cites [MC&CO](https://www.mcandco.agency/fr/work/funke/).

The application does not claim access to Santoni's private order-management systems, authenticated account data or commercial provider contracts. No Santoni logo, campaign text or proprietary font was copied into Goya content.

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

## Verification — 24 October 2026

- 92 unit tests passed, including order ownership, return quantities, stock restoration, credential changes, recovery, administrator provisioning and catalogue preservation.
- 43 distinct desktop/mobile browser journeys passed across the full run and focused reruns after corrections. The mobile duplicate of the desktop campaign-animation test remains intentionally skipped.
- Browser journeys include guest/customer checkout, demo MoMo, saved billing/gifting, account recovery, availability alerts, owner service responses, returns/refunds, fit recommendations, colour SKUs and all four personalization/consultation paths.
- TypeScript, production build, source lint and original/archive image validation passed.
- All automated writes used isolated local demo data with an empty `DATABASE_URL`. Hosted verification is read-only.
