"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Globe,
  UserCheck,
  KeyRound,
  Eye,
  Server,
  Wifi,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { brand } from "@/config/brand.config";

const securityChecks = [
  { label: "Initiate Verified", description: "Your email has been verified and your access confirmed.", icon: UserCheck },
  { label: "Secure Connection", description: "All data is transmitted over an encrypted HTTPS tunnel.", icon: Lock },
  { label: "Session Protected", description: "Your session is authenticated with a rotating secure token.", icon: KeyRound },
  { label: "Vault Encryption", description: "Your armed links and account data are encrypted at rest.", icon: Eye },
  { label: "Network Status", description: `All ${brand.productName} extraction nodes are online and operational.`, icon: Server },
  { label: "Payout Connectivity", description: "The connection to your affiliate network is stable and monitored.", icon: Wifi },
];

const activityLog = [
  { event: "Successful access", time: "Just now", icon: UserCheck },
  { event: "Session renewed", time: "2 minutes ago", icon: KeyRound },
  { event: "Security sweep completed", time: "15 minutes ago", icon: ShieldCheck },
  { event: "SSL certificate verified", time: "1 hour ago", icon: Lock },
  { event: "Node health check passed", time: "3 hours ago", icon: Server },
];

export default function WealthProtectorPage() {
  const [email, setEmail] = useState("your account");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-5xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8 lg:p-10 border border-[#45A29E]/20"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#45A29E]/10 border border-[#45A29E]/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-1">
              Society Access
            </p>
            <h1 className="brand-font text-2xl md:text-3xl text-text-heading tracking-tight">
              Wealth Protector
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Your account security overview — monitored in real time so your assets stay locked down.
            </p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
            <span className="text-sm font-bold text-green-400 uppercase tracking-wider">All Systems Secure</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Security Score", value: "100%", icon: ShieldCheck, color: "text-green-400" },
          { label: "Account Status", value: "Verified", icon: CheckCircle2, color: "text-green-400" },
          { label: "Encryption", value: "AES-256", icon: Lock, color: "text-accent" },
          { label: "Uptime", value: "99.9%", icon: Globe, color: "text-[#D4AF37]" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-tile"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-extrabold text-text-heading">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security checks */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="brand-font text-lg text-text-heading mb-1">Security Checks</h2>
          {securityChecks.map((check, i) => (
            <motion.div
              key={check.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="glass-tile flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <check.icon className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-text-primary">{check.label}</h3>
                <p className="text-xs text-text-muted">{check.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider hidden sm:inline">Verified</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="glass-card p-5 border border-[#45A29E]/10">
            <h3 className="text-sm font-bold text-text-primary mb-4">Account Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-text-muted">Email</span>
                <span className="text-xs text-text-primary font-medium truncate ml-4">{email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-text-muted">Membership</span>
                <span className="text-xs text-green-400 font-bold">Active Initiate</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-text-muted">Secure Token</span>
                <span className="text-xs text-green-400 font-bold">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-text-muted">Last Access</span>
                <span className="text-xs text-text-primary font-medium">Today</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activityLog.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary font-medium">{item.event}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-text-muted/60" />
                      <span className="text-[10px] text-text-muted/60">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
