"use client";

import { motion } from "framer-motion";
import { brand } from "@/config/brand.config";
import { BrandLogo } from "./BrandLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
}

export function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{ backgroundColor: brand.colors.authPage }}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]"
          style={{ backgroundColor: `${brand.colors.primary}0d` }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]"
          style={{ backgroundColor: `${brand.colors.primary}0d` }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-6 sm:p-8 lg:p-10 flex flex-col gap-6 sm:gap-8 border-[#141414] shadow-2xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <BrandLogo size="lg" showTagline={false} />
            {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
