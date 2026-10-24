# Maison Goya

A luxury boutique with seven interface languages, an installable PWA, a working demonstration backend, and an owner workspace. Next.js 16, React 19, TypeScript, Tailwind 4 and GSAP.

**Accounts, uploads, inventory, orders, private customer requests and account notifications are persistent. Payments, shipping, carrier tracking and atelier appointments are demonstrations. No money moves and no service email is sent.**

## Start

Use Node.js 22 or newer:

```sh
npm ci
npm run setup:demo
npm run dev
```

- Public brand website: http://localhost:3000
- Customer login / registration: http://localhost:3000/login
- Public collection: http://localhost:3000/collections
- Owner workspace: http://localhost:3000/admin
- Local admin: `admin@goya.demo` / `MaisonDemo2026!`
- Browse, search, save favourites, check sizes, use the bag, place demo orders and request atelier appointments as a guest. A customer account is optional for shopping.
- Customer dashboard: http://localhost:3000/app (`/account` redirects here).

Use fictitious personal details and a unique demo password. Passwords are salted and hashed on the server, and sessions use HTTP-only cookies. The local admin defaults are disabled on hosted production.

`setup:demo` enables local persistence and generates private Web Push keys in `.env.local`. Keep that file private. Local shop data and uploads live in ignored `.data/` files and survive refreshes and server restarts.

## Customer experience

The public website combines brand storytelling with a working demonstration shop. Visitors can browse products, search in English or French, check per-size availability, save a wishlist and complete a simulated checkout without signing in. `/login` adds a protected customer workspace at `/app`: overview, account orders with delivery progress and invoice downloads, atelier appointments, updates, and saved personal details. It is separate from the protected owner workspace. Each customer sees only their own account data.

Public pages include `/collections`, `/men`, `/women`, `/accessories`, `/new-arrivals`, `/gifts`, `/product/[id]`, `/wishlist`, `/bag`, `/checkout`, `/track-order`, `/maison`, `/shoe-care` and `/culture/[slug]`. The seeded catalog contains 25 Goya listings using actual supplied or historical Goya photographs. Prices, product names and stock remain illustrative. Men’s and women’s footwear is grouped by style; filters and counts use the actual published catalog.

The presentation follows measured desktop/mobile shell, catalogue, service and editorial structures from the client’s [Santoni reference](https://www.santonishoes.com/int-en/), using Goya content, identity and photographs. This is not a claim of complete visual or functional equivalence. The shared Goya vector wordmark and PWA remain intact; the reference’s Avus Pro interface font awaits an appropriate licence. See [font licensing](docs/FONT-LICENSING.md).

- Campaign films, four men/women footwear-and-accessory destinations, product carousels, editorial pages and a responsive customer shop.
- English, French, Italian, German, Spanish, Japanese and Arabic interface choices; 100 countries plus International; 12 illustrative demo currencies.
- English/French original catalogue and editorial content, with an English/French admin editor. New admin uploads and text are not automatically translated into the other five languages.
- Product galleries and zoom, related colour SKUs, per-size availability, a size drawer, an illustrative conversion chart and fit questionnaire, filters, sorting, bag quantities and saved preferences.
- Public shopping, guest demo checkout, and optional account sign-in for saved details and account history.
- Mobile Money operator/number entry followed by explicit demo approval or decline. No PIN, SMS or real wallet authorization.
- Card and wallet demonstration choices without collecting card details. The bag's PayPal/Apple Pay actions preselect simulated checkout; no provider is connected. Demo code `GOYA10` is validated by the backend, and its product discount carries into checkout, saved orders and invoices.
- Server-calculated totals, atomic stock allocation and duplicate-order protection.
- Saved account order history, cookie-owned guest tracking at `/track-order`, immutable order details and downloadable text demo invoices.
- Persistent demonstration atelier appointments, private contact/newsletter/availability requests and owner responses, plus return/refund processing.
- Account updates and optional Web Push for orders and new arrivals.
- Home-screen installation, app icons and an offline reconnection screen. The installed app starts at the public collection; ordering and current stock require connectivity.

Guest orders are restricted to their owning session or an explicit lookup using the exact order reference and checkout email; an order number alone grants no access. They are not automatically transferred to an account. Guest wishlists stay on the device; signed-in wishlists sync to the account.

Contact, newsletter and availability forms save private, persistent demonstration records in the backend. Owners can review service requests and respond through the admin workspace; no real email is sent. Demo password recovery can change a password only with previously issued browser proof and a single-use, expiring reset token. It is not a live email-recovery service. Registration has no email verification. Use fictitious details throughout.

## Owner workspace

`/admin` provides a compact overview, bilingual product editor, image uploads, per-size quantities, publish/draft controls, order processing, private customer-service requests, return/refund stages and new-arrival announcements.

Orders move through Confirmed → Preparing → On its way → Delivered. Cancellation before shipment returns stock once. The original name, image, price and size are saved on each order even if the catalog changes later.

Published products and shop controls are public. Draft products, administration, customer profiles and account history remain protected by server-side authorization. Guest bookings and orders are exposed only to their owning guest session. Customer authentication uses email/password access.

## Hosting

The target is **Netlify Free + Neon Free**, with Netlify Blobs for uploaded images. Free tiers are subject to their resource limits.

The same backend uses a local atomic file store for local review and a versioned PostgreSQL JSONB aggregate with optimistic concurrency on Neon. The aggregate is intentionally scoped to a small demo, not a production merchant platform.

See [deployment instructions](docs/DEMO-HOSTING.md) for required environment variables, deployment steps, notification setup and a complete demonstration script. No external hosting or database account is created automatically.

## Code map

| Area | Location |
| --- | --- |
| Page, layout, app manifest and styling | `app/` |
| Admin workspace | `app/admin/`, `components/admin/` |
| Storefront components and dialogs | `components/` |
| Client state, persistence and refresh | `context/shop-context.tsx`, `lib/store.ts` |
| Domain contracts and commerce helpers | `lib/types.ts`, `lib/commerce.ts` |
| Initial demonstration catalog and historical Goya listings | `lib/catalog.ts`, `lib/archive-catalog.ts` |
| Interface translations and original bilingual journal | `lib/i18n.ts`, `lib/international.ts`, `lib/translations/`, `lib/storefront.ts`, `lib/service-copy.ts`, `lib/culture-stories.ts` |
| Auth, stock, orders, persistence and Web Push | `lib/server/` |
| Public catalog, owner-scoped commerce API and protected uploads | `app/api/` |
| Service worker and offline screen | `public/sw.js`, `public/offline.html` |
| Unit and browser tests | `tests/` |

Updates refresh periodically while pages are visible, on focus, and immediately across tabs in the same browser. There is no permanently open realtime socket.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run check:assets
npm run build
npx playwright install chromium
npm run test:e2e
```

The Playwright suite uses the production build on port 3100. To use an installed Edge browser, set `PLAYWRIGHT_CHANNEL=msedge` before running the browser suite. Browser test data is separate from the local demonstration shop.

Supplied brand photographs and the historical Goya archive are retained. Product galleries use only available source photographs; they do not fabricate additional angles. The asset check verifies file signatures, not ownership, product accuracy or visual suitability. Source and demo boundaries are recorded in [experience notes](docs/DEMO-EXPERIENCE.md).

The visual direction and campaign asset provenance are documented in [design notes](docs/DESIGN-DIRECTION.md); current interface-font licensing is documented in [font licensing](docs/FONT-LICENSING.md).

Brand research and its uncertainties are recorded in [research notes](docs/BRAND-RESEARCH.md). Prices, stock, specific initial product descriptions, policies and appointment schedules remain illustrative. No brand authorization or live commercial capability is implied.

Before real commerce, replace simulated payments and fulfillment, establish production identity/recovery workflows and commercial policies, and review the data model, security, privacy and operational requirements.
