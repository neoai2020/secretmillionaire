"use client";

import { motion } from "framer-motion";
import { Headphones, Sparkles } from "lucide-react";
import { support } from "@/config/support.config";
import { brand } from "@/config/brand.config";
import { ContactSupportWidget } from "@/components/dashboard/ContactSupportWidget";

export default function SupportPage() {
  return (
    <div className="flex min-h-[calc(100dvh-10rem)] flex-col lg:min-h-[calc(100dvh-6rem)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary tracking-tight">
          {support.pageTitle}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
          {support.pageSubtitle}
        </p>
      </motion.div>

      <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="w-full max-w-lg"
        >
          <div
            className="promo-gradient-border relative overflow-hidden rounded-2xl px-5 py-5 sm:px-6 sm:py-6"
            style={{
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(69,162,158,0.08)",
            }}
          >
            <div
              className="pointer-events-none absolute top-0 right-0 h-48 w-48 opacity-20"
              style={{
                background: `radial-gradient(circle, ${brand.colors.encryptedGreen} 0%, transparent 70%)`,
              }}
            />

            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(69,162,158,0.4)",
                      "0 0 0 8px rgba(69,162,158,0)",
                      "0 0 0 0 rgba(69,162,158,0.4)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(69,162,158,0.2), rgba(212,175,55,0.15))",
                    border: "1px solid rgba(69, 162, 158, 0.4)",
                  }}
                >
                  <Headphones size={24} strokeWidth={1.5} className="text-accent" />
                </motion.div>
                <div className="min-w-0 flex flex-col gap-1 pt-1">
                  <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                    {support.headline}
                  </h2>
                  <p className="text-sm leading-relaxed text-[#9ca3af]">{support.subcopy}</p>
                </div>
              </div>

              <ContactSupportWidget embedded />

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/8 pt-4">
                {support.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-1.5 text-[10px] text-text-muted"
                  >
                    <Sparkles size={10} className="shrink-0 text-[#D4AF37]" />
                    <span>
                      {stat.label}
                      {"highlight" in stat && stat.highlight ? (
                        <>
                          {" "}
                          <strong className="text-[#D4AF37]">{stat.highlight}</strong>
                        </>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
