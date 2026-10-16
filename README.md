# Maison Goya

A bilingual luxury boutique with an installable PWA, a working demonstration backend, and an owner workspace. Next.js 16, React 19, TypeScript, Tailwind 4 and GSAP.

**Accounts, uploads, inventory, orders and account notifications are persistent. Payments, shipping, carrier tracking and atelier appointments are demonstrations. No money moves.**

## Start

Use Node.js 22 or newer:

```sh
npm ci
npm run setup:demo
npm run dev
```

- Public brand website: http://localhost:3000
- Customer login / registration: http://localhost:3000/login
- Protected customer shop: http://localhost:3000/app/shop
- Owner workspace: http://localhost:3000/admin
- Local admin: `admin@goya.demo` / `MaisonDemo2026!`
- Customers sign in or register before accessing the collection, bag, checkout or appointments.
- Customer dashboard: http://localhost:3000/app (`/account` redirects here).

Use fictitious personal details and a unique demo password. Passwords are salted and hashed on the server, and sessions use HTTP-only cookies. The local admin defaults are disabled on hosted production.

`setup:demo` enables local persistence and generates private Web Push keys in `.env.local`. Keep that file private. Local shop data and uploads live in ignored `.data/` files and survive refreshes and server restarts.

## Customer experience

The public website tells the brand story and introduces its creations and services. It has no shopping controls. `/login` opens a protected customer workspace at `/app`: overview, orders with delivery progress and invoice downloads, atelier appointments, updates, and saved personal details. It is separate from the protected owner workspace. Each customer sees only their own account data.

- The existing four-chapter brand story and responsive collection.
- English/French interface and catalog content; search across both languages.
- EUR/USD/XOF demonstration price books.
- Product galleries, per-size availability, bag quantities and saved preferences.
- Account creation and sign-in before shopping, then delivery and simulated payment inside the customer app.
- Mobile Money operator/number entry followed by explicit demo approval or decline. No PIN, SMS or real wallet authorization.
- Card and Apple Pay simulations without collecting card details.
- Server-calculated totals, atomic stock allocation and duplicate-order protection.
- Saved order history, status journey, immutable order details and downloadable text demo invoices.
- Persistent demonstration atelier appointments.
- Account updates and optional Web Push for orders and new arrivals.
- Home-screen installation, app icons and an offline reconnection screen. The installed app starts at the collection; ordering and current stock require connectivity.

## Owner workspace

`/admin` provides a compact overview, bilingual product editor, image uploads, per-size quantities, publish/draft controls, order processing and new-arrival announcements.

Orders move through Confirmed → Preparing → On its way → Delivered. Cancellation before shipment returns stock once. The original name, image, price and size are saved on each order even if the catalog changes later.

The public website provides brand information. Customers must sign in to browse products, check stock, book services or order; every activity stays in the customer app. This version uses email/password access; there are no pretend Google/Apple sign-in buttons or password-reset emails.

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
| Initial demonstration catalog | `lib/catalog.ts` |
| Bilingual copy | `lib/i18n.ts`, `lib/copy.ts` |
| Auth, stock, orders, persistence and Web Push | `lib/server/` |
| Protected backend API and uploads | `app/api/` |
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

Brand/product photos are present in all eleven initial slots. Slots 3, 4 and 11 use their supplied WebP files directly. The asset check verifies file signatures, not ownership, product accuracy or visual suitability.

Brand research and its uncertainties are recorded in [research notes](docs/BRAND-RESEARCH.md). Prices, stock, specific initial product descriptions, policies and appointment schedules remain illustrative. No brand authorization or live commercial capability is implied.

Before real commerce, replace simulated payments and fulfillment, establish production identity/recovery workflows and commercial policies, and review the data model, security, privacy and operational requirements.
