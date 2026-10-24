# Local validation - 16 October 2026

> Historical validation of the earlier login-required shopping flow. The later Santoni-inspired revision adds public shopping, optional customer accounts and cookie-owned guest checkout/tracking. The results below describe the dated run, not verification of that newer flow. See [CUSTOMER-ACCOUNT.md](CUSTOMER-ACCOUNT.md) for current routes and access rules.

The application retains separately authorized customer and administrator workspaces alongside the public storefront.

The production build and TypeScript check pass. The 55 backend, commerce, translation, session and inventory unit tests pass. The previous complete lint check passed before the final catalog corrections; the later targeted check did not complete before hosting preparation.

Browser runs verified desktop/mobile protected routes, customer registration, internal shop navigation, demo MoMo checkout, upload/publication, fulfillment updates, settings, persistence and service-worker registration. The last full run had 20 passes and six failures/timeouts. Two failures exposed a French catalog encoding issue, which has been corrected in source. Other failures occurred in account and late mobile checks during a slow run and a concurrent rebuild. This is not a claim of a fully passing final browser suite.

The user requested moving on to hosting before another regression run. Validate the hosted customer journey after deploying. Actual physical-device PWA installation and Web Push delivery remain to be checked on HTTPS. Neon and Netlify integration must be verified against the user's new accounts.
