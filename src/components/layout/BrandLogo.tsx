"use client";

import { brand } from "@/config/brand.config";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  compact?: boolean;
}

const SIZES = {
  sm: {
    box: "w-9 h-9 sm:w-10 sm:h-10",
    img: 40,
    title: "text-sm sm:text-base lg:text-[18px]",
    tagline: "text-[9px] sm:text-[10px]",
  },
  md: {
    box: "w-10 h-10 sm:w-12 sm:h-12",
    img: 48,
    title: "text-base sm:text-[20px]",
    tagline: "text-[10px]",
  },
  lg: {
    box: "w-16 h-16 sm:w-20 sm:h-20",
    img: 80,
    title: "text-xl sm:text-[28px]",
    tagline: "text-xs sm:text-sm",
  },
};

export function BrandLogo({ size = "sm", showTagline = true, compact = false }: BrandLogoProps) {
  const s = SIZES[size];

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
      <div
        className={`${s.box} relative shrink-0 rounded-lg overflow-hidden flex items-center justify-center`}
        style={{
          background: "transparent",
          boxShadow: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logo.src}
          alt={brand.logo.alt}
          width={s.img}
          height={s.img}
          className="object-contain w-full h-full p-0.5"
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className={`brand-font ${compact ? "text-xs sm:text-sm leading-tight" : s.title} text-text-primary tracking-tight leading-tight line-clamp-2 sm:line-clamp-none`}
        >
          {brand.productName}
        </span>
        {showTagline && !compact && (
          <span className={`${s.tagline} font-semibold text-text-muted mt-0.5 truncate`}>
            {brand.tagline}
          </span>
        )}
      </div>
    </div>
  );
}
