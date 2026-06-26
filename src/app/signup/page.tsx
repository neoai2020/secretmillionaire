"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Mail, Lock, UserPlus, ShieldAlert, User, Eye, EyeOff } from "lucide-react";
import { ONBOARDING_META_KEY } from "@/config/onboarding-content";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { brand } from "@/config/brand.config";
import { webhooks } from "@/config/webhooks.config";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            full_name: name,
            [ONBOARDING_META_KEY]: false,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
      } else {
        if (webhooks.signup) {
          const firstName = name.trim().split(/\s+/)[0];
          fetch(webhooks.signup, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, email }),
          }).catch(() => {});
        }

        if (data.session) {
          window.location.href = "/onboarding";
        } else {
          window.location.href = "/login";
        }
      }
    } catch {
      setError("An unexpected system error occurred.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle={brand.signupTagline}>
      <form onSubmit={handleSignup} className="flex flex-col gap-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-4 rounded-sm flex items-center gap-3 text-red-400 text-sm"
          >
            <ShieldAlert size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#475569] ml-1">Full Name</label>
          <div className="relative group">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="input-base w-full pl-12"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#475569] ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-accent transition-colors" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-base w-full pl-12"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#475569] ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-accent transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input-base w-full pl-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-accent transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          <span className="flex items-center justify-center gap-2">
            {loading ? "Creating account..." : (
              <>
                Sign Up
                <UserPlus size={18} />
              </>
            )}
          </span>
        </button>
      </form>

      <div className="flex flex-col items-center gap-4 border-t border-[#141414] pt-8">
        <p className="text-[#475569] text-xs">Already have an account?</p>
        <Link href="/login" className="brand-font text-accent text-xs font-bold tracking-wide hover:text-white transition-colors">
          Log In
        </Link>
      </div>
    </AuthLayout>
  );
}
