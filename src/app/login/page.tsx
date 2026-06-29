"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { brand } from "@/config/brand.config";
import { socialProof } from "@/config/social-proof.config";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else if (data.user) {
        window.location.href = "/dashboard";
      } else {
        setLoading(false);
      }
    } catch {
      setError("An unexpected system error occurred.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle={brand.authTagline}>
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
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
          <label className="text-[10px] font-black uppercase tracking-widest text-[#475569] ml-1">
            Email
          </label>
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
          <label className="text-[10px] font-black uppercase tracking-widest text-[#475569] ml-1">
            Password
          </label>
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

        <div className="flex justify-end -mt-1">
          <Link href="/forgot-password" className="text-[11px] text-text-muted hover:text-accent transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          <span className="flex items-center justify-center gap-2">
            {loading ? "Authorizing..." : (
              <>
                Log In
                <LogIn size={18} />
              </>
            )}
          </span>
        </button>
      </form>

      <div className="flex flex-col items-center gap-4 border-t border-white/10 pt-8">
        <p className="text-text-muted text-xs">New here?</p>
        <Link href="/signup" className="brand-font text-accent text-xs font-bold tracking-wide hover:text-white transition-colors">
          Sign Up
        </Link>
      </div>

      {socialProof.enabled && socialProof.loginPage.activeMembers > 0 && (
        <p className="text-center text-[11px] text-text-muted border-t border-white/10 pt-6">
          Network capacity:{" "}
          <strong className="text-[#45A29E]">
            {socialProof.networkCapacity.current}/{socialProof.networkCapacity.max}
          </strong>{" "}
          Initiates online
        </p>
      )}
    </AuthLayout>
  );
}
