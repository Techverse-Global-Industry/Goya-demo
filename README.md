# Maison Goya

**L’Héritage Croisé — a complete bilingual luxury storefront and scrollytelling frontend.**

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, GSAP, `@gsap/react`, and ScrollTrigger. The visual system pairs obsidian and charcoal with champagne gold, Playfair Display and Inter.

The implementation contains all requested frontend flows. Authentication, checkout, tracking, inventory and atelier reservations are explicitly simulated. It does not create real accounts, charge money, send messages, reserve real appointments or submit an order to the Maison.

## Run

Use Node.js 22 or newer. From the extracted project directory:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Dependency installation requires registry access. `next/font/google` also needs access to its font sources at build time; the resulting fonts are self-hosted by Next.js. No font binaries are distributed in this source package.

The manifest constrains Next.js and its ESLint configuration to major version 16 and React to major version 19. An npm lockfile is not included because this delivery environment could not resolve the package registry. After the first successful `npm install`, inspect and commit the generated `package-lock.json`; use `npm ci` for reproducible subsequent CI and deployment installs.

## Required images

Copy the eleven approved brand images into `public/images/`. No source photographs were provided, so no actual product imagery is bundled. Missing photographs receive a localized archive treatment rather than an unrelated replacement image.

Narrative panels use exactly slots 1, 2, 3 and 4. Product cards use exactly slots 4 through 11. The preferred paths are `/images/img1.jpg` through `/images/img11.jpg`.

The brief also names `img3.webp`, `img4.webp` and `img11.webp`. Those three paths are supported as runtime fallbacks, while the stated JPEG convention remains primary. For a clean production request path, supply the JPEG version of every slot. See `public/images/README.md` for the full mapping.

```bash
npm run check:assets
```

This command deliberately fails until the required assets are present. A normal build does not require the images so the frontend can be reviewed before media handoff. The release gate does require them.

## Implemented experience

### Navigation and internationalization

A fixed frosted header contains the wordmark, story/collection/atelier navigation, search, member access, bag count, EN | FR controls, and currency selection. A responsive navigation drawer preserves access on small screens. Currency selection is also available in the collection, bag and quick view.

A single context drives **244 translation keys per language**, including narrative text, product names, descriptions, materials, colors, accessible labels, validation messages, notifications, payment choices, booking screens, confirmation details and invoice text. Open dialogs include a language toggle because the modal background is intentionally inert. Changing language does not recreate a checkout form or discard a size selection. The document language updates with the selection.

### Narrative and motion

Four full-screen chapters tell the supplied Maison story. At viewport widths of at least 900px and heights of at least 620px, with reduced motion disabled, ScrollTrigger pins the section and drives a horizontal translation using `scrub: 1` and `xPercent: -100 * (panels.length - 1)`.

Image layers, titles, subtitles and body copy move at different speeds. Incoming imagery and typography have restrained scale and skew treatments. The chapter navigation and progress line track the story, and keyboard users can jump directly between chapters. Off-screen chapters are inert only while horizontal mode is active.

Smaller viewports and reduced-motion users receive all four chapters as full-width vertical sections. No story content is omitted. Other sections use scoped reveal animations, and product images use restrained CSS hover zoom.

All GSAP work lives in scoped `useGSAP` hooks. Event-triggered GSAP work uses `contextSafe`. `gsap.matchMedia()` contexts are reverted, ScrollTriggers are torn down, and scheduled refresh/focus frames are cancelled during cleanup. Ordinary React effects are used only for browser state synchronization, storage, document language and notification timers—not for creating GSAP animations.

### Collection and quick view

All eight requested products are implemented with bilingual descriptive copy, category filters, material details, badge labels and a fixed EUR/USD/XOF price book. The exact names and image order are retained in English; French names are localized.

Footwear has EU sizes 39–46, with size-specific illustrative stock. Bags correctly use one size, and the belt uses centimetre lengths. Product-card add buttons open size selection when a variant is required; one-size bags can be added immediately. Quick view shows remaining quantities and prevents adding beyond available stock.

Search works across localized product names, materials, descriptions and categories, with accent-insensitive matching. Submitting the search applies its query to the full collection.

### Bag and checkout

The slide-over bag provides thumbnails, sizes, quantity controls, removal, currency selection, subtotal and a shipping progress tracker. Quantities are clamped to available stock. Locale, currency and sanitized cart selections are persisted to local storage, with cross-tab updates.

Checkout has three complete stages:

1. Validated shipping details with Benin, France, Senegal, USA and UK country choices.
2. Simulated credit card, Apple Pay, Mobile Money or boutique-pickup payment. Mobile Money is enabled for Benin/Senegal; Cotonou pickup is enabled for Benin.
3. A demonstration order confirmation, monetary snapshot, clearly simulated tracking reference, order summary and a downloadable bilingual plain-text invoice.

Completion is atomic in the reducer, preventing duplicate orders from repeated clicks. It empties the bag, updates tab-local demo inventory, and adds an order to the current simulated member’s history. Completed-order currency and unit prices are snapshots, so subsequent currency changes cannot rewrite past order totals.

No card number, expiry date, CVV, payment token or real wallet authorization is requested. Invoices explicitly say they are not tax invoices or proof of payment.

### Membership

Google and Apple buttons create clearly simulated users without contacting either provider. A separate email/password tab validates demonstration input and immediately discards the password after sign-in. The password is never persisted or sent.

The signed-in view includes the Maison Goya VIP badge, member details, session-local order history, appointment history, invoice access and sign-out. History is scoped to the current simulated user. Orders placed as a guest are not automatically associated with a subsequently simulated social account.

### Atelier

The Cotonou section presents Glaçage, custom patina, heel replacement and bag restoration. The booking modal includes name/email, service, boutique, date and time selection for Cotonou, Paris and Dakar.

The illustrative schedule offers Monday–Saturday appointments within 90 days. Dates and time comparisons use each boutique’s time zone. Past, impossible, Sunday, out-of-window and previously selected time slots are rejected. Confirmation is localized and unambiguously marked as a demonstration, not a real reservation.

### Accessibility and resilience

Native `dialog.showModal()` supplies modal focus containment and inert background content. The shell adds Escape handling, outside-pointer dismissal, animated entry/exit, focus restoration and reversible scroll locking. Forms have associated labels, error descriptions and invalid-state attributes. Controls have accessible names and focus indicators; radio groups use native inputs. The page includes a skip link and reduced-motion behavior.

Images use `next/image` with responsive sizes, fixed layout containers, a preloaded initial hero, explicit alternative text and guarded format fallback. Error, loading and not-found states are included. These implementation measures are not a claim of an independently audited accessibility certification.

## Business assumptions

The product descriptions, material specifications, prices, stock quantities, shipping thresholds and booking schedule are illustrative merchandising data, not verified live commercial records. The founder/history narrative follows the supplied brief.

Currency values are a **fixed demo price book**, not live foreign-exchange conversions. EUR and USD are stored in cents; XOF uses whole currency units. Values are integers, and fractional euro/dollar values retain both decimal places.

| Currency | Complimentary delivery from | Below-threshold delivery |
| --- | ---: | ---: |
| EUR | €600 | €20 |
| USD | $650 | $25 |
| XOF | 395,000 XOF | 15,000 XOF |

Cotonou pickup is complimentary. No VAT, sales tax, import duty, live carrier service, delivery promise or actual returns policy is calculated or asserted.

## Data boundaries

`localStorage['maison-goya:v1']` contains only:

```json
{
  "version": 1,
  "locale": "en",
  "currency": "EUR",
  "cart": [{ "productId": "francesco", "size": "42", "quantity": 1 }]
}
```

The reducer validates restored IDs, variants and quantities and ignores corrupt storage. Restricted storage does not prevent shopping during the current session.

Profiles, shipping details, orders, bookings and demo stock allocations live only in React memory. They are not stored across refreshes. Refreshing resets demo inventory and history. This is intentional demonstration behavior, not an inventory-reservation system. Use fictitious personal details.

There are no analytics, OAuth requests, payment calls, transactional emails or backend API stubs hidden in this package.

## Project structure

```text
app/
  layout.tsx              Server-owned root layout, fonts, metadata, provider
  page.tsx                Client entry composing the complete storefront
  globals.css             Tailwind import, tokens, responsive design system
  error.tsx               Localized recoverable error state
  loading.tsx             Localized loading state
  not-found.tsx           Localized 404 state
  icon.svg                Maison monogram favicon
components/
  header.tsx              Desktop header and mobile navigation
  story.tsx               Four-panel GSAP narrative
  editorial.tsx           Manifesto, atelier section and footer
  collection.tsx          Category filters and eight product cards
  maison-image.tsx        Exact image routing and graceful media failure
  cart.tsx                Quick view and cart drawer
  checkout.tsx            Delivery, payment and confirmation flow
  auth.tsx                Simulated OAuth/email access and member profile
  booking.tsx             Atelier booking and confirmation
  search.tsx              Live localized catalog search
  modal-shell.tsx         Accessible native dialog with scoped GSAP motion
  overlays.tsx            Single-overlay routing
  controls.tsx            Fields, preferences, notifications and demo notices
  icon.tsx                Inline UI icon set
context/
  shop-context.tsx        Shared state, translations, totals and persistence
lib/
  types.ts                Domain contracts
  i18n.ts                 Complete English/French dictionary
  assets.ts               Authoritative image-slot mapping
  catalog.ts              Eight bilingual products and atelier options
  commerce.ts             Pure money, stock, validation and scheduling logic
  store.ts                Typed atomic state reducer
  browser.ts              Navigation, demo references and invoice download
  gsap.ts                 Browser-safe plugin registration
public/images/
  README.md               Required image handoff, including WebP exceptions
scripts/
  check-assets.mjs        Release asset preflight
  offline-validate.cjs    Optional offline syntax/domain/test validation
tests/
  commerce.test.ts        Commerce, stock, storage and booking unit tests
  i18n.test.ts            Translation and product-copy coverage
  e2e/storefront.spec.ts  Desktop/mobile browser interaction suite
docs/
  VALIDATION.md           What was and was not executed for this delivery
  validation.json        Machine-readable validation summary
  unit-tests.tap         Executed unit-test output
  RELEASE.md             Real-commerce release boundaries and checklist
```

## Validation commands

After dependencies are installed:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The Playwright server uses the production build on port 3100. The browser suite covers translation state, cart persistence, stock caps, checkout validation, payment restrictions, invoice download, simulated sign-in, focus containment, Escape/focus restoration, search, category filters, atelier confirmation, reduced motion and single-instance pinning after language changes. Browser binaries must be installed before running it.

For an asset-complete release gate:

```bash
npm run check:release
```

During delivery, 39 domain/translation tests passed, all 33 TypeScript/TSX files passed syntax validation, all seven pure domain modules passed strict semantic type checking, and the stylesheet parsed successfully. Dependency installation was blocked by registry DNS access, so **the full Next.js build, complete framework typecheck, ESLint, Tailwind compilation and Playwright browser suite were not executed**. See `docs/VALIDATION.md`; do not interpret the unit-test results as an end-to-end production certification.

## Real-commerce release

This package is deployable frontend source for the requested simulated experience, not a live merchant system. Supply approved imagery and validate the full build before deployment. Before accepting real customers, replace simulations with authenticated, server-authoritative integrations and approved commercial policies; see `docs/RELEASE.md`.

No deployment, GitHub repository, connected account or external service was modified as part of this delivery.

## Primary implementation references

- [Next.js App Router installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js server/client boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [GSAP React and useGSAP](https://gsap.com/resources/React/)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/)
- [Native dialog behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)

Third-party packages retain their respective licenses. The source package does not grant rights to the Maison Goya trademark, photographs, product designs or brand assets.
