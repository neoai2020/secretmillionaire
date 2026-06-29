"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { getAppUrl } from "@/lib/brand-vars";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const appUrl = getAppUrl();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle={sent ? "Check your inbox for the reset link" : "Enter your email and we'll send you a reset link"}>
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5 py-4"
        >
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <p className="text-xs text-text-secondary text-center max-w-xs">
            We sent a password reset link to <strong className="text-text-primary">{email}</strong>.
          </p>
          <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-sm text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#475569] ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-accent transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-base w-full pl-12"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            <span className="flex items-center justify-center gap-2">
              {loading ? "Sending..." : (
                <>
                  <Mail size={18} />
                  Send Reset Link
                </>
              )}
            </span>
          </button>
        </form>
      )}

      <div className="flex flex-col items-center gap-4 border-t border-white/10 pt-6">
        <Link href="/login" className="flex items-center gap-2 text-xs text-text-muted hover:text-accent transition-colors">
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </div>

      <div className="flex items-center justify-center gap-1 text-[10px] text-text-muted">
        <ShieldCheck size={10} className="text-green-400" />
        <span>256-bit Encrypted</span>
      </div>
    </AuthLayout>
  );
}
