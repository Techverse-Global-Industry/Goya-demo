# Goya reference alignment

Reviewer handoff, 24 October 2026. Goya follows measured public Santoni storefront structures with Goya content, photographs, demonstration commerce and an installable PWA. This document distinguishes observed reference states from implemented demo behavior; it does not assert complete visual, commercial or tested parity.

The reference was inspected in Edge at 1440 × 1000 desktop and 393 × 851 mobile sizes. Public page captures, computed styles, interaction states and stylesheet evidence are retained in the ignored `.data/exact-reference/` directory. No real Santoni order, account, enquiry or appointment was submitted.

## Shared shell and brand

The storefront uses one shared Goya vector wordmark across navigation, account/admin surfaces, loading states, country selection and PWA branding. The wordmark is separate from interface typography. Desktop opening header geometry is a 42px promotion strip plus a 61px navigation row; the measured phone layout uses 42px plus 51px. The home header overlays campaign media, then changes on scroll. Seven main menus expose grouped desktop navigation and a three-level mobile menu, with dedicated search, wishlist, account and bag actions.

The footer follows the reference hierarchy: newsletter, customer care, brand/editorial links, legal/company links, social destinations, language, country and legal text. Desktop uses columns with 40px vertical padding; mobile presents the newsletter first, collapsible link sections and full-width 48px language/country rows. Goya supplies its own content and policies. Cookie preferences and the optional newsletter invitation use the measured banner/panel structures while describing the actual demo behavior.

Avus Pro Light, Regular and Semi Bold are the reference interface weights. **Goya does not yet hold the required webfont licence.** The application uses its bundled licensed fallback through `var(--sans)`, so typography remains a material visual difference. Official buying choices were blocked by browser verification; no webfont price, traffic tier or term was verified. See [font licensing](FONT-LICENSING.md) before changing fonts.

## Catalogue and product interactions

| Area | Desktop structure | Phone structure |
| --- | --- | --- |
| Catalogue opening | 24px/600 title; title and category rail share a row; 48–49px toolbar | 24px/600 title; category rail below; toolbar before grid |
| Product grid | Four square-media columns, 2px column gaps and 24px row gaps | Two square-media columns, no column gutter and 48px row gaps |
| Product copy | Centred 16px/300 names and 14px prices | Centred 14px/300 names and prices |
| Filtering | 360px drawer; size, colour, material, category and construction; real result counts | Drawer leaves 40px of the underlying page visible; same inventory facets |
| Sorting/pagination | Custom accessible listbox; 30 initial products when available, load-more/count control and page navigation | Same controls adapted to available width |
| PDP gallery | 42vw square slides, pointer dragging, scroll snapping, 48px thumbnails and zoom | Square vertical gallery, position indicator and photo count; white information overlays sticky media |
| PDP information | 22px/600 title; purchase column up to 510px; tabbed detail content | 16px/600 title; separate detail/shipping/care triggers open right-side drawers |
| Size and fit | 600px size, chart and fit drawers; unavailable rows open Notify me | Size and fit use full width; chart leaves 40px of the page visible |
| Wishlist | Horizontal rows, 180px media, product details, remove and add-to-bag | 150px media and a full-width add-to-bag action below each row |
| Empty bag | 350 × 54px nonmodal popover below the header | Compact popover within viewport width |
| Populated bag | 500px side panel; 120px product images; full bag has two columns with 475px inner regions | Full-width bottom sheet; full bag stacks its regions |

Ordinary catalogue cards navigate to products rather than adding extra quick-shop or wishlist trays. A second real supplied photograph appears on hover when available. Category, curated new-in/gifting/featured membership, accessory audience and filter counts use the published inventory. The seed contains **25 Goya listings using actual supplied or historical Goya photographs**; names, prices and availability are illustrative demo data. Related colour options select separate SKUs with separate stock. Galleries do not fabricate missing camera angles.

The size picker remains connected to inventory. The five-column illustrative chart shows Goya size, EU, UK, USA and centimetres. Fit questions collect the usual size and foot width, then derive a local demo recommendation. These conversions have not been verified by Goya and do not reproduce a proprietary fit provider's measurement accuracy.

## Search

Search opens a full-width layer below the promotion strip, with a 64px input row. Desktop has a 259px suggestion column and product content on the right. Its initial state includes suggested destinations, most-searched style chips and a real product carousel. Typing displays lexical suggestions and up to five product suggestions; phone suggestions use two columns. No-results state retains discovery content, and View all results opens the full catalogue results page.

English/French matching is retained, including accent normalization. Selected-language metadata matching keeps translated seeded-product queries consistent between the overlay and full results. A recent-search list is not shown in the reference-style overlay.

## Services, account and editorial pages

Login uses a single centred form, approximately 502px wide at the measured desktop viewport, rather than a split editorial layout. Registration has its own wider form. Recovery uses a right drawer. Goya's backend keeps recovery restricted to previously issued browser proof and a single-use, expiring reset; entering an email alone does not authorize a reset, and no recovery email is sent.

Personalization is an editorial sequence with distinct bespoke, made-to-order, on-time and caring pages. Implemented structures include full-height media heroes, centred statements, alternating media/copy, process columns and consultation destinations. On-time links to eligible products rather than presenting an unsupported instant configurator. Caring includes a service carousel and an optional assessment brief with photos.

Appointments begin with online/boutique choices. Online consultation has service, appointment and contact stages; boutique adds store selection. Desktop uses a working area and recap, while mobile stacks them. FAQs use a category sidebar and ruled question rows on desktop, with responsive category navigation on mobile. Store maps use illustrative city centres and do not invent unverified Goya street addresses or hours.

The homepage retains four distinct men/women new-in/accessory destinations, a real product carousel and thirteen original bilingual journal destinations. Captions, controls and native scrolling follow the measured reference hierarchy. The journal heading is “Goya anthology” / “Anthologie Goya.” Culture, craftsmanship and collaboration pages have distinct structures: alternating full-height panels; split opening, portrait media rail and prose bands; and split media/copy with galleries, quotations and a final diptych. Goya's own history replaces reference-brand history; no Italian academy or unverified current partnership is attributed to Goya.

Contact, newsletter, availability, service and consultation forms persist private demo records. Customers/guests see their own records; administrators can review and respond. Return requests, stock restoration and simulated refund stages share the backend. These actions create no real email, shipment, appointment or money transfer.

## International behavior and PWA

The interface offers English, Italian, French, German, Spanish, Japanese and Arabic, including RTL presentation. Country selection uses a separate minimal page: seven region tabs and country columns on desktop, region accordions on mobile, flags and a two-character search threshold. Language selection uses a 360px desktop drawer and full-width phone drawer. Country choice sets its default language/currency; language can subsequently change while retaining the market.

Goya supports **100 country markets plus International (`WW`)**. The reference directory supplied 98 countries; Goya retains its Benin and Senegal demo markets. Twelve supported demo currencies are EUR, USD, XOF, GBP, JPY, AED, CHF, CAD, SAR, KWD, TRY and CNY. Additional regional prices derive deterministically from the demo price book; they are not live exchange rates or commercial quotes.

Original catalogue/editorial content and admin editing remain English/French. New admin text and uploads are not automatically translated into the other five languages. The shared wordmark remains unchanged by language selection. The PWA, installation icons and offline reconnection screen remain; current stock and ordering require connectivity.

## Evidence limits and pending integrations

- The reference's size-variation AJAX selected a size but removed its purchase control. Its populated bag and checkout could not be independently exercised. Populated-bag geometry therefore comes from the public stylesheet, not a completed live checkout comparison. Goya preserves its own working demo purchase flow.
- Reference fit capture reached the external calculation loader; Goya's local illustrative recommendation is an explicit substitute.
- The full bag includes a promo-code accordion with backend validation, apply/remove/error feedback and quote-based totals. Demo code `GOYA10` discounts products; checkout, saved orders and invoices retain the server-calculated discount. PayPal/Apple Pay bag actions preselect the corresponding simulated checkout. These additions await final regression verification; no live wallet provider is connected. Card/wallet/MoMo and installment presentations do not transfer money or issue credit.
- Original Goya media differs from Santoni campaign media, available product angles differ, and Avus Pro is pending a licence. Those differences prevent a claim of complete visual equivalence.
- Private Santoni account systems, order-management tools and provider contracts were not accessible and are not claimed as replicated.

## Primary reference pages

- [International home](https://www.santonishoes.com/int-en/) and [US shopping home](https://www.santonishoes.com/us-en/)
- [Men's loafers catalogue](https://www.santonishoes.com/us-en/man/shoes/loafers/) and [audited Carlo loafer PDP](https://www.santonishoes.com/us-en/mens-brown-suede-carlo-driver-penny-loafer-MCNC19298SI6SEAAM21.html)
- [Country directory](https://www.santonishoes.com/countries/) and [account login](https://www.santonishoes.com/us-en/customer/account/login/)
- [One of One](https://www.santonishoes.com/int-en/personalization/one-of-one/), [bespoke](https://www.santonishoes.com/int-en/one-of-one-bespoke.html), [made to order](https://www.santonishoes.com/int-en/one-of-one-made-to-order.html), [on-time](https://www.santonishoes.com/int-en/one-of-one-on-time.html) and [caring](https://www.santonishoes.com/int-en/personalization/caring---one-forever/)
- [Appointment entry](https://www.santonishoes.com/int-en/book-an-appointment.html), [store locator](https://www.santonishoes.com/us-en/store-locator/), [shipping FAQ](https://www.santonishoes.com/int-en/faq-shipping-delivery.html) and [returns FAQ](https://www.santonishoes.com/int-en/faq-returns-refunds.html)
- [Santoni Is](https://www.santonishoes.com/us-en/culture/santoni-is/), [academy](https://www.santonishoes.com/us-en/culture/accademia-delleccellenza/) and [Homo Faber](https://www.santonishoes.com/us-en/culture/homo-faber/)

Goya's historical source material and the 2020 collaboration attribution are documented in [experience notes](DEMO-EXPERIENCE.md). Reference raw evidence and the catalogue discrepancy log remain in `.data/exact-reference/`.

## Validation

Verified locally on 24 October 2026:

- Production build and strict TypeScript check passed; 115 pages were generated.
- Full application lint passed on 186 files. The two subsequently added verification files were checked separately.
- All 118 backend, commerce, translation and privacy regression tests passed, including server-owned promotion quotes, JPY/KWD rounding, immutable paid prices and bounded refunds.
- The main browser run and corrected focused reruns exercised all 57 distinct active desktop/mobile journeys successfully. One duplicate mobile run of the desktop-only animation scenario was intentionally skipped. This is an aggregate across runs, not a claim of one uninterrupted green full-suite run.
- The public page audit passed 138 page/language/viewport checks with no detected runtime errors or horizontal overflow. After the final discount changes, all 16 focused desktop/mobile journeys passed, followed by both complete GOYA10 express-order/invoice journeys.
- Final PWA checks passed: the country logo fits its header, shared wordmark paths match, Arabic/Japanese menus retain brand names, the offline Japanese screen works, and Cache Storage contains no private account/API pages.

Browser writes used fresh local demo data, never the hosted inventory. Physical-device installation and real push delivery are separate device checks. The exact Avus Pro interface font still requires the publisher-issued webfont licence and kit described in [font licensing](FONT-LICENSING.md).
