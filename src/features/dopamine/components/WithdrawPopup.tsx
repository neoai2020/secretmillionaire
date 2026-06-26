"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { offers } from "@/config/offers.config";
import { brand } from "@/config/brand.config";

const SESSION_KEY = "sms_withdraw_shown";
const WITHDRAW_AMOUNT = "$214.36";

function shouldSkipSession(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function WithdrawPopup({ onVisibilityChange }: { onVisibilityChange?: (visible: boolean) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldSkipSession()) return;

    const timer = setTimeout(() => {
      if (process.env.NODE_ENV === "production") {
        sessionStorage.setItem(SESSION_KEY, "1");
      }
      setVisible(true);
      onVisibilityChange?.(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onVisibilityChange]);

  const handleClose = () => {
    setVisible(false);
    onVisibilityChange?.(false);
  };

  const green = brand.colors.encryptedGreen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-[60] w-[380px] max-w-[calc(100vw-3rem)]"
        >
          <div
            className="relative overflow-hidden rounded-2xl bg-[#0c0e0c]"
            style={{
              border: `1px solid ${green}4D`,
              boxShadow: `0 25px 70px rgba(0,0,0,0.9), 0 0 40px ${green}26`,
            }}
          >
            <div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none"
              style={{ background: `${green}1A` }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl pointer-events-none"
              style={{ background: `${green}0D` }}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all z-20 cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="relative z-10 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: green,
                    boxShadow: `0 0 8px ${green}99`,
                  }}
                />
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: green }}
                >
                  Account Verified
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="shrink-0" style={{ color: green }} />
                  <h3 className="text-lg font-black text-white leading-tight">Congratulations!</h3>
                </div>
                <p className="text-[15px] text-white font-bold">
                  You&apos;re Eligible To Withdraw{" "}
                  <span className="text-xl" style={{ color: green }}>
                    {WITHDRAW_AMOUNT}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-text-muted">
                <div className="flex items-center gap-1">
                  <ShieldCheck size={10} style={{ color: green }} />
                  <span>Verified Balance</span>
                </div>
                <span>·</span>
                <span>Ref: HX-29459-9022</span>
              </div>

              <motion.a
                href={offers.withdrawRouting}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2.5 w-full h-12 text-[#0B0C10] font-black text-sm uppercase tracking-wider rounded-xl transition-colors"
                style={{
                  backgroundColor: green,
                  boxShadow: `0 4px 20px ${green}4D`,
                }}
              >
                <DollarSign size={18} />
                <span>Withdraw Now</span>
                <ArrowRight size={16} />
              </motion.a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
