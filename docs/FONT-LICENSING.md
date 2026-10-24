# Goya website font licences

The interface currently uses the locally bundled Inter font under its accompanying open font licence. The Goya wordmark is a single vector asset derived from the bundled Cormorant font, whose OFL notice remains in `public/fonts`. The same wordmark paths are used in the website, account and admin surfaces, country selector and PWA icons.

## Exact reference interface font: pending

The reference interface uses Avus Pro by RMU. Goya has confirmed that it does **not** currently hold a webfont licence. No Avus Pro font software is bundled, hosted or represented as licensed in this repository. Creating this document does not grant a licence.

The intended weights are Light, Regular and Semi Bold. Obtain a quote from the publisher's authorised distributor for the actual Goya domain and expected pageviews:

- [Avus Pro family and licence options](https://www.myfonts.com/collections/avus-pro-font-rmu)
- [Light buying choices](https://www.myfonts.com/products/light-avus-pro-247920/licenses)
- [Regular buying choices](https://www.myfonts.com/products/regular-avus-pro-247931/licenses)
- [Semi Bold buying choices](https://www.myfonts.com/products/medium-avus-pro-247949/licenses)
- [Publisher's webfont agreement](https://www.myfonts.com/pages/license-agreement?id=eula_2267)

Select **Webfont**, check the displayed style name, domain coverage, pageview tier, term, renewal and tax, and save the quote before approving payment. A Desktop licence is a different product. On 24 October 2026 the buying controls were blocked by browser verification, so no specific webfont price or term was verified. Nothing was purchased and no terms were accepted.

After the owner obtains the appropriate licence and webfont kit, retain the invoice and agreement privately. Integrate the supplied webfont files through `next/font/local`, map their variable to `--sans`, and verify all weights on desktop and mobile. The Goya wordmark remains its own separate vector asset. Keep licence documents and any restricted font software out of a public repository unless the publisher explicitly permits that distribution.
