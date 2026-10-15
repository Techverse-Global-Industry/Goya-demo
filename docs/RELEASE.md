# Release boundaries

## Deploying the demonstration

Install dependencies in a networked Node.js 22+ environment. Review and commit the generated lockfile. Supply the eleven approved images, run the asset preflight, then run lint, the full TypeScript check, unit tests, a production build and the browser suite. Validate the built app at desktop, tablet and phone sizes with both languages and all three currencies.

The app needs no API keys for its simulated frontend features. Use HTTPS, preserve the configured security headers and review deployment-specific caching. Indexing is intentionally disabled in `app/layout.tsx` while this is a demonstration.

The default headers set `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`. They are not a complete production security audit. A strict CSP needs a deployment-specific nonce strategy compatible with Next.js scripts and the application’s GSAP inline styles; an overly restrictive static CSP should not be pasted in blindly.

## Crossing into real commerce

The following are different product capabilities, not dormant switches or hidden implementation placeholders in this demo:

**Identity.** Use an actual identity provider with verified redirect URIs, protected server sessions, secure cookies and account linking. Never treat the client’s simulated user or VIP badge as an authorization signal. Demo email/password validation is not an authentication service.

**Pricing and stock.** Move authoritative product data, market-specific prices, reservations and stock decrementing to trusted server operations. Revalidate line items, quantities and totals at checkout. Browser storage and React state must never authorize a price, a discount or a stock allocation. Use durable transaction boundaries and idempotency keys.

**Payments.** Integrate approved provider-hosted checkout or secure payment elements. Keep secrets server-side, verify provider callbacks/webhooks, and create a paid order only after provider-confirmed payment. A button click or client-generated tracking number must never constitute proof of payment. Verify actual Apple Pay and regional Mobile Money availability with the selected payment provider.

**Orders and fulfillment.** Persist order snapshots, shipping addresses, actual carrier data and customer ownership with authenticated access. Add server-side tax and shipping calculation, real receipt handling and transactional messaging. Replace all `DEMO-` and `SIM-` references and the demonstration invoice generator with the approved merchant workflow.

**Atelier appointments.** Obtain the boutiques’ approved addresses, opening hours, time-zone rules, staff/service capacity and cancellation policy. Use server-side slot locking so simultaneous customers cannot reserve the same resource. Send a real booking confirmation only after durable acceptance.

**Content, privacy and commercial review.** Verify the supplied brand narrative and obtain approval for every product name, description, material, image, price, stock figure, service statement and policy. Replace demonstration shipping/returns/privacy disclosures with the actual approved terms. Obtain necessary consents and establish an appropriate personal-data retention policy before collecting real details.

Only remove the demonstration notices and the `noindex` setting once the corresponding real features, brand approvals and policies are in place. Do not simply relabel the client-side simulations as live services.

## Quality gates

Review keyboard-only navigation, focus restoration, screen-reader announcements, mobile date pickers, high zoom, reduced-motion mode, French text wrapping and all missing-image cases in real browsers. Test checkout interruption, reload, cross-tab bag changes, stock exhaustion and slow connections. Confirm there is only one ScrollTrigger pin spacer across repeated locale changes and viewport transitions.

The included Playwright suite is an executable baseline, not a substitute for a visual, accessibility, payment, privacy or security audit.
