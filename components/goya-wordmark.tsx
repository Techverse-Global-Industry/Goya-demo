"use client";

import { useId } from "react";
import type { CSSProperties } from "react";
import { GOYA_ARTWORK, GOYA_BRAND_VERSION } from "@/lib/goya-brand";
import type { GoyaBrandVariant } from "@/lib/goya-brand";

/** Display the supplied artwork itself, including its exact logo lettering. */
export function GoyaWordmark({
  className = "",
  style,
  variant = "wordmark",
}: {
  className?: string;
  style?: CSSProperties;
  variant?: GoyaBrandVariant;
}) {
  const id = useId();
  const artwork = GOYA_ARTWORK[variant];
  const maskId = `goya-artwork-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      className={`goya-wordmark goya-wordmark--${variant} ${className}`}
      viewBox={`0 0 ${artwork.width} ${artwork.height}`}
      fill="currentColor"
      aria-label="Goya"
      role="img"
      focusable="false"
      data-goya-wordmark
      data-goya-variant={variant}
      data-goya-source={artwork.src}
      data-goya-brand-version={GOYA_BRAND_VERSION}
      style={style}
    >
      <defs>
        <mask
          id={maskId}
          x="0"
          y="0"
          width={artwork.width}
          height={artwork.height}
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <image
            href={artwork.src}
            width={artwork.width}
            height={artwork.height}
          />
        </mask>
      </defs>
      <rect
        width={artwork.width}
        height={artwork.height}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
