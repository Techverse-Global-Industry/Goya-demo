# Customer application architecture

The public website (`/`) presents the brand, heritage, collection categories and atelier information. Its calls to action enter the protected customer application. It does not expose product inventory, bags, search or checkout.

`/login` offers customer registration and sign-in. A validated internal return destination preserves the requested page or product after authentication. Admin accounts enter `/admin`; customer accounts cannot access admin operations.

Customer routes:

- `/app`: personal overview.
- `/app/shop`: bilingual collection, English/French search, category filters, galleries, sizes and availability.
- `/app/orders`: saved orders, delivery progress, payment details and demonstration invoice downloads.
- `/app/atelier`: booking and saved appointments.
- `/app/updates`: notifications and opt-in device notifications.
- `/app/settings`: personal details, language and currency.

Every customer route validates the server session. `/account` is a compatibility redirect to `/app`. Shopping dialogs live inside the customer workspace. Search submissions, empty-bag actions, checkout confirmation, installed-app launch and push notification links stay inside `/app`. Navigation supports reloads and browser history.

Signed-out API snapshots contain no products, appointments, orders or announcements. Authenticated customer data is filtered by account ownership on the server. Passwords are salted and hashed; sessions use HTTP-only cookies. Signing out clears private client state and the bag. Persisted bags are associated with the signed-in customer.

All payments, fulfillment and bookings remain demonstrations. Neon/Netlify hosting and physical-device push delivery require separate hosting setup and verification.
