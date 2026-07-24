"use client";

import { motion } from "framer-motion";
import { BrandLogo } from "./BrandLogo";
import { FloatingSupportButton } from "@/components/support/FloatingSupportButton";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
}

export function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div className="app-main-canvas min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="app-glow-orb app-glow-orb-teal" aria-hidden />
      <div className="app-glow-orb app-glow-orb-gold" aria-hidden />
      <div className="app-glow-orb app-glow-orb-center" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-content-layer w-full max-w-md mx-auto relative z-10 px-1 sm:px-0"
      >
        <div className="glass-card p-6 sm:p-8 lg:p-10 flex flex-col gap-6 sm:gap-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <BrandLogo size="lg" showTagline={false} />
            {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
          </div>
          {children}
        </div>
      </motion.div>

      <FloatingSupportButton />
    </div>
  );
}
