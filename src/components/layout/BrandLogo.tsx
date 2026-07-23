"use client";

import { clsx } from "clsx";
import { brand } from "@/config/brand.config";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  compact?: boolean;
  splitTitle?: boolean;
}

const SIZES = {
  sm: {
    imgHeight: "h-9 sm:h-10",
    img: 40,
    title: "text-sm sm:text-base lg:text-[18px]",
    tagline: "text-[9px] sm:text-[10px]",
  },
  md: {
    imgHeight: "h-10 sm:h-12",
    img: 48,
    title: "text-base sm:text-[20px]",
    tagline: "text-[10px]",
  },
  lg: {
    imgHeight: "h-16 sm:h-20",
    img: 80,
    title: "text-xl sm:text-[28px]",
    tagline: "text-xs sm:text-sm",
  },
};

export function BrandLogo({
  size = "sm",
  showTagline = true,
  compact = false,
  splitTitle = false,
}: BrandLogoProps) {
  const s = SIZES[size];
  const societyIndex = brand.productName.lastIndexOf(" Society");
  const titleBeforeSociety =
    societyIndex > 0 ? brand.productName.slice(0, societyIndex) : brand.productName;
  const titleAfterSociety =
    societyIndex > 0 ? brand.productName.slice(societyIndex + 1) : "";

  return (
    <div className={clsx("flex items-center min-w-0", compact ? "justify-center" : "gap-2.5 sm:gap-3")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brand.logo.src}
        alt={brand.logo.alt}
        width={s.img}
        height={s.img}
        className={`${s.imgHeight} w-auto object-contain shrink-0`}
        loading="eager"
        decoding="async"
      />
      {!compact && (
        <div className="flex flex-col min-w-0">
          <span
            className={clsx(
              "brand-font text-text-primary tracking-tight leading-tight",
              s.title,
              !splitTitle && "whitespace-nowrap"
            )}
          >
            {splitTitle && titleAfterSociety ? (
              <>
                {titleBeforeSociety.replace(/ /g, "\u00a0")}
                <br />
                {titleAfterSociety.replace(/ /g, "\u00a0")}
              </>
            ) : (
              brand.productName.replace(/ /g, "\u00a0")
            )}
          </span>
          {showTagline && (
            <span className={`${s.tagline} font-semibold text-text-muted mt-0.5 truncate`}>
              {brand.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
