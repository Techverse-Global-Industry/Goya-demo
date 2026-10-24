# Maison Goya presentation

The presentation follows the structure of the client’s [Santoni reference](https://www.santonishoes.com/int-en/): a left-aligned wordmark and collection navigation, a full-screen campaign film, four footwear category photographs, paired men’s and women’s campaigns, a second craft film, a concise brand statement, a horizontally browsable editorial journal, and a compact white service footer. The copy, identity and imagery are Goya’s. No Santoni photography, film, logo or code is included.

The public site has distinct routes for `/collections`, `/men`, `/women`, `/accessories`, footwear styles, `/product/[id]`, `/maison`, `/shoe-care` and `/culture/[slug]`. Visitors can browse the published catalog, check prices and size availability, save favourites, use the bag and complete a simulated guest checkout. Optional accounts retain a protected personal area for saved details, history and notifications; administration remains separately protected.

## Presentation and interaction

- White surfaces, black type, understated controls, small uppercase sans-serif campaign captions and full-bleed imagery. The Goya wordmark retains its serif character.
- English and French presentation, shop, service and original journal copy is in `lib/fashion-copy.ts`, `lib/storefront.ts`, `lib/service-copy.ts` and `lib/culture-stories.ts`. The reference layout is composed through `app/reference-design.css`, `app/catalog-reference.css`, `app/product-detail.css` and `app/editorial-reference.css`, alongside the existing account styles.
- Desktop category menus support pointer, click, keyboard and Escape. Phone navigation uses the existing accessible dialog.
- Silent, inline, looping MP4 films have image posters and visible play/pause controls. Playback stops outside the viewport and in hidden tabs. Reduced-motion and data-saving preferences start with a static image; explicit play is available.
- Videos load only when visible and automatic playback is permitted, or when the visitor presses play. They are not added to the service-worker cache.
- The six-story Goya journal supports native touch/trackpad scrolling, scroll snapping, keyboard navigation and previous/next buttons. Each story has its own bilingual `/culture/[slug]` page.
- Category entrances, campaign captions and page sections use scoped GSAP reveals; the paired still life has subtle scroll parallax. The full-body portrait retains its complete framing. The same motion respects reduced-motion preferences. Route changes clean up and recreate page reveals.
- The collection follows the reference’s compact title, text style rail, native sorting, facet drawer, four-column desktop/two-column phone product grid, editorial tile and real viewed counts. Product pages place a horizontal gallery above purchase information, with zoom, sizes, stock, wishlist, detail tabs and recommendations. The eight initial Goya listings use the actual supplied photographs; extra products, colours, photo angles and size conversions are not invented. Styles are derived from bilingual product names in `lib/merchandising.ts`; unclassified uploads remain visible in All.
- `app/brand-pages.css` shapes the public pages; `app/mobile-boutique.css` adapts the shared visual language to the customer app. The phone dock keeps collection, orders, care, updates and account details within reach.
- Category and member-home shopping links open matching public gender/style routes. Guest checkout and atelier booking are supported; private account and admin links still require their respective sessions.
- Guest tracking is limited to the valid browser session cookie and is not a public order-number lookup. The compact footer offers account, service, language, region and PWA controls. Newsletter preferences, contact, availability and recovery remain clearly labelled demonstrations with no real email delivery.

## Media provenance

The customer catalog continues to show the supplied Goya product photographs. Campaign images are AI-generated editorial concepts based on those supplied references, rather than evidence of a commissioned shoot or exact production details.

| Asset | Reference / source |
| --- | --- |
| `goya-movement-men.webp` | Supplied `img3.webp`: black loafer with a colourful woven strap, shown with charcoal tailoring |
| `goya-movement-women.webp` | Supplied `img4.webp`: midnight-blue sculptural woven heels, shown with an ivory skirt |
| `goya-sneakers.webp` | Supplied `img7.jpg`: geometric-pattern lace-up sneaker |
| `goya-boots.webp` | Supplied `img9.jpg`: cream and black ankle boots |
| `img2.jpg` | Existing supplied Goya portrait used for the full-body left homepage campaign and Maison editorial |
| `goya-signature.webp`, `goya-signature-mobile.webp` | Editorial still-life concepts based on `img3.webp`; used in matching product/editorial surfaces |
| `goya-sculpture.webp` | Editorial still life based on `img4.webp`, used for the right homepage campaign and a Goya journal story |
| `public/videos/goya-movement.mp4` | [Ron Lach, Pexels #9464485](https://www.pexels.com/video/people-wearing-shoes-while-walking-9464485/) — footwear in motion |
| `public/videos/goya-craft.mp4` | [Rachel Claire, Pexels #7724737](https://www.pexels.com/video/male-shoemaker-working-7724737/) — footwear finishing |
| `public/videos/goya-campaign.mp4` | Current opening film: the licensed Ron Lach walking shot edited with the client-supplied `19456-303877307_medium.mp4`, using a short dissolve |
| `public/videos/goya-care-film.mp4` | Current craft film: an eight-second excerpt of the client-supplied `17222575_1920_1080_25fps.mp4` |
| `goya-care-poster.webp` | A frame extracted from the client-supplied polishing film |

The two original Pexels films are stock concepts used for the demonstration, not footage of Goya products, employees or premises. They were resized, stripped of audio and compressed for direct delivery. Their poster images are extracted frames. The [Pexels license](https://www.pexels.com/license/) permits free use and modification. Source files remain outside the deployed application.

The two original Pexels clips remain as reference exports; the active presentation uses `goya-campaign.mp4` and `goya-care-film.mp4`. The client explicitly supplied and authorized the additional root-folder media for this redesign. Those originals are preserved unchanged; only the selected, compressed excerpts are deployed. The campaign stills remain editorial concepts; supplied video is not represented as a shoot at Goya’s premises.

Inter and Cormorant Garamond are self hosted, with OFL license files in `public/fonts/`. The private source discussion PDF remains excluded from version control because it contains account credentials.

## Verification

Review covers desktop, tablet and phone presentation, both languages, responsive overflow and image loading, campaign playback/pause, reduced-motion behaviour, menu keyboard access and editorial browsing. Commerce checks use a separate local demo store and exercise account access, product sizes, ordering, simulated MoMo payment, order history, appointments and administration. No live database is used for local test writes.
