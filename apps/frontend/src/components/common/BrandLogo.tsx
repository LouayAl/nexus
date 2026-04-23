// frontend/src/components/common/BrandLogo.tsx
"use client";

import { useState } from "react";

const BRAND_LOGO_SRC = "/brand/Logo.webp";

export function BrandLogo({
  href,
  height = 34,
  dark = false,
}: {
  href?: string;
  height?: number;
  dark?: boolean;
}) {
  const [hasError, setHasError] = useState(false);

  const content = hasError ? (
    <span
      className="font-display"
      style={{
        fontSize: Math.max(18, Math.round(height * 0.55)),
        fontWeight: 900,
        color: dark ? "white" : "#10406B",
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}
    >
      s3m
    </span>
  ) : (
    <img
      src={BRAND_LOGO_SRC}
      alt="S3M"
      onError={() => setHasError(true)}
      style={{
        height,
        width: "auto",
        display: "block",
        objectFit: "contain",
      }}
    />
  );

  if (!href) {
    return content;
  }

  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
      }}
    >
      {content}
    </a>
  );
}
