# Maison Goya presentation

The October 2026 redesign takes its presentation cues from the Santoni reference in the client discussion: campaign photography, a centered masthead, generous space, editorial collection tiles and a substantial footer. It expresses Goya through its woven shoe detail, warm stone, olive ink and the meeting of European and African influences. No Santoni artwork, photography, logos or code is included.

## Visual system

- Ivory paper (`#f8f6f1`), charcoal olive text (`#29281f`), bronze details (`#796446`) and a dark olive footer (`#30392f`).
- Cormorant Garamond for display typography; Inter for controls and reading. Both are self hosted with their OFL licenses in `public/fonts/`.
- A wide desktop campaign and a separate portrait composition for phones. The browser selects the appropriate optimized source through `picture` and Next.js `getImageProps`.
- Normal vertical scrolling, gentle entrance motion and reduced-motion support.
- Consistent materials and hierarchy across public pages, account access, the private customer application, dialogs and administration.
- A five-item phone navigation dock, with the personal overview accessible through the Goya wordmark or menu.

`app/maison-design.css` contains the presentation system. English and French presentation strings are in `lib/presentation-copy.ts`. Commerce, authentication and persistence continue to use their existing contracts.

## Campaign assets

The images in `public/images/campaign/` are AI-generated editorial concepts created from the supplied Goya footwear references. They are presentation imagery, not evidence of a commissioned photographic shoot or exact production product details. The actual customer catalog continues to show the supplied brand/product photographs.

- `goya-signature.webp`: wide black loafer still life, based on supplied `img3.webp`.
- `goya-signature-mobile.webp`: portrait variant of that campaign, with space for mobile typography.
- `goya-sculpture.webp`: women's editorial still life, based on supplied `img4.webp`.

The source client discussion PDF is kept out of version control because it contains account credentials.

## Review

The local visual review covers public presentation in both languages, account access, collection, product sizes, bag, delivery, demo MoMo approval, order confirmation/history, appointment form and the admin product editor at desktop and phone widths. Test data uses a separate local store. Release check results are reported with the completed change.
