// Official owner-supplied artwork; retain its letterforms and spacing.
export const GOYA_BRAND_VERSION = "official-0782d2307edc";
export const GOYA_ARTWORK = {
  "wordmark": {
    "src": "/brand/goya-wordmark.png",
    "width": 1460,
    "height": 415,
    "source": "/brand/official/goya-wordmark.png",
    "sha256": "82f9884610117cb26e1eb327f23b94fab73841cbb9f826f13097737eef88eb80"
  },
  "signature": {
    "src": "/brand/goya-signature.png",
    "width": 1460,
    "height": 603,
    "source": "/brand/official/goya-signature.png",
    "sha256": "eab2afe0dc6708835e746dc87866c012f3a25fcb96a0a8b485840922232056fa"
  },
  "emblem": {
    "src": "/brand/goya-emblem.png",
    "width": 1459,
    "height": 1200,
    "source": "/brand/official/goya-emblem.png",
    "sha256": "71c6d98101f0fde90ff5c021e84e424669b96dc2a1744e6eb7b7916de2f9007e"
  },
  "symbol": {
    "src": "/brand/goya-symbol.png",
    "width": 348,
    "height": 553,
    "source": "/brand/official/goya-emblem.png",
    "sha256": "71c6d98101f0fde90ff5c021e84e424669b96dc2a1744e6eb7b7916de2f9007e"
  }
} as const;
export type GoyaBrandVariant = keyof typeof GOYA_ARTWORK;
