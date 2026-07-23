"use client";

import { support } from "@/config/support.config";

export default function SupportPage() {
  return (
    <div className="page-stack w-full page-container">
      <div className="flex flex-col gap-2 sm:gap-3">
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-text-primary tracking-tight">
          {support.pageTitle}
        </h1>
        <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
          {support.pageSubtitle}
        </p>
      </div>
    </div>
  );
}
