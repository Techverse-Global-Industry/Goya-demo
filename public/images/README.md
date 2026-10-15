# Maison Goya — image handoff

No brand photographs were attached to the request. This directory intentionally contains no substitute stock photographs or fabricated product images. The application shows a designed, localized Maison archive treatment when the required photograph is unavailable.

Place the approved images here. Paths are case-sensitive on typical production hosts.

| Preferred filename | Assignment | Supported fallback |
| --- | --- | --- |
| `img1.jpg` | Narrative 01 — L’Héritage Croisé | None |
| `img2.jpg` | Narrative 02 — craftsmanship; atelier editorial | None |
| `img3.jpg` | Narrative 03 — woven heritage | `img3.webp` |
| `img4.jpg` | Narrative 04; Le Francesco Loafer | `img4.webp` |
| `img5.jpg` | L’Artisan Kanvo Oxford | None |
| `img6.jpg` | Royal Raffia Monk Strap | None |
| `img7.jpg` | Cotonou Patina Leather Tote | None |
| `img8.jpg` | Italian Calfskin Belt | None |
| `img9.jpg` | Kente Accent Derby | None |
| `img10.jpg` | Décontracté Chic Mule | None |
| `img11.jpg` | Heritage Weekender Bag | `img11.webp` |

The brief gives a universal JPEG convention and also names WebP files for slots 3, 4 and 11. The implementation resolves that conflict by preferring JPEG and trying the explicitly supplied WebP alternative only when the JPEG fails. Supply all eleven JPEG files for a clean initial request path. Do not merely rename WebP file bytes to `.jpg`; convert the image format properly.

`public/images/img1.jpg` is served as `/images/img1.jpg`, never `/public/images/img1.jpg`.

Use wide editorial crops for slots 1–3 and a crop for slot 4 that works both in the narrative and product card. Product images should support approximately 4:5 crops. Inspect every crop on desktop and mobile; `object-fit: cover` is intentional. The first narrative image is preloaded. Next.js supplies responsive sizes and optimizes served imagery.

Run from the project root:

```bash
npm run check:assets
```

The command checks each required slot and its JPEG/WebP byte signature. It does not certify licensing, subject accuracy, image resolution, color fidelity or complete decoder validity. Those require review of the actual approved assets.
