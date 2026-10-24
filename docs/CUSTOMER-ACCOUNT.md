# Customer application architecture

The public website (`/`) presents the brand and a working demonstration storefront. Shopping no longer requires login: published products, English/French search, size availability, wishlist, bag, guest checkout and atelier booking are public. The initial catalog has eight Goya demo listings based on the actual supplied photographs; administrative drafts remain private.

`/login` offers customer registration and sign-in. A validated internal return destination preserves the requested page or product after authentication. Admin accounts enter `/admin`; customer accounts cannot access admin operations.

Public shopping routes:

- `/collections`, `/men`, `/women`, `/accessories`: published catalog, real catalog filters, sorting and style links.
- `/men/loafers`, `/men/sneakers`, `/women/heels`, `/women/boots`: footwear styles.
- `/new-arrivals`, `/gifts`: collection edits.
- `/product/[id]`: product gallery and zoom, sizes, availability, size guidance and wishlist.
- `/wishlist`, `/bag`, `/checkout`: guest or signed-in shopping.
- `/track-order`: orders belonging to the current guest cookie or signed-in account.

Protected customer routes:

- `/app`: personal overview.
- `/app/shop`: the shared catalog within the signed-in customer workspace; public shopping remains available at `/collections`.
- `/app/orders`: saved orders, delivery progress, payment details and demonstration invoice downloads.
- `/app/atelier`: booking and saved appointments.
- `/app/updates`: notifications and opt-in device notifications.
- `/app/settings`: personal details, saved addresses, language and currency.

Protected customer routes validate the server session. `/account` is a compatibility redirect to `/app`. Public catalog, product, bag and checkout routes support reloads and browser history. The installed PWA starts at `/collections`; its orders shortcut and account notifications lead to the protected personal area.

Signed-out API snapshots include published products, announcements and anonymous appointment-slot availability. They include only the orders and bookings owned by a valid guest session cookie. An arbitrary order or tracking number cannot retrieve another visitor’s records. Guest tracking is browser-bound, requires connectivity and a valid cookie, and is not automatically transferred when signing in. Clearing cookies, expiry or signing out can remove access to those guest records.

Authenticated account data is filtered by account ownership on the server. Admin operations require an administrator session. Passwords are salted and hashed; sessions use HTTP-only cookies. Signing out clears private client state and the bag. Guest bags and wishlists persist locally; signed-in wishlists sync to the account, while account ownership is checked when restoring preferences.

The interface and catalog are bilingual French/English, including search terms across both languages. PWA installation and offline reconnection are implemented; account pages and API responses are not cached for offline use. Current stock, orders and checkout require a network connection.

All payments, fulfillment and bookings remain demonstrations. Mobile Money, card and Apple Pay move no money. Contact, newsletter, availability and recovery previews send no real email; recovery does not change a password, and registration does not verify email. Physical-device installation and Web Push delivery require HTTPS verification after deployment.
