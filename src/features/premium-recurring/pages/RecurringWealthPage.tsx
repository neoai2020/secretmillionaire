"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  RefreshCw,
  Globe,
  Crown,
  ExternalLink,
  X,
  CheckCircle2,
  Loader2,
  ClipboardPaste,
  DollarSign,
  Percent,
  Users,
  CreditCard,
  TrendingDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { RECURRING_PRODUCTS, type RecurringProduct } from "../data/products";

const NICHE_COLORS: Record<string, string> = {
  "Pet Training": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "YouTube / AI Tools": "text-red-400 bg-red-400/10 border-red-400/20",
  "Health Supplements": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Online Education": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "Financial Education": "text-accent bg-[#45A29E]/10 border-[#45A29E]/20",
  "Presentations / Software": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Affiliate Marketing": "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20",
  "Dating / Relationships": "text-pink-400 bg-pink-400/10 border-pink-400/20",
  "AI Writing Tools": "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "AI Platform": "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
};
const DEFAULT_NC = "text-text-muted bg-white/5 border-white/10";

interface BuiltSite {
  slug: string;
}

function GetWebsitePopup({
  product,
  onClose,
  onBuilt,
}: {
  product: RecurringProduct;
  onClose: () => void;
  onBuilt: (slug: string) => void;
}) {
  const [affiliateLink, setAffiliateLink] = useState("");
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuild = async () => {
    if (!affiliateLink.trim()) return;
    setBuilding(true);
    setError(null);
    try {
      const res = await fetch("/api/blog/get-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, affiliateUrl: affiliateLink }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not build your website");
      onBuilt(data.site?.slug ?? "");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build your website");
      setBuilding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={building ? undefined : onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass-card p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {!building && (
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-text-heading hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        )}

        {building ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <div>
              <p className="text-base font-bold text-text-heading">Building your website…</p>
              <p className="text-xs text-text-muted mt-1 max-w-xs">
                Cloning the tested-to-convert articles for <strong className="text-text-secondary">{product.name}</strong> and
                weaving in your link. This can take a minute the first time — hang tight.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
                <Sparkles className="w-3 h-3" /> Tested-to-convert content
              </div>
              <h2 className="brand-font text-xl text-text-heading mb-1">Get Website: {product.name}</h2>
              <p className="text-sm text-text-muted">
                We&apos;ll drop a ready-made {25}-article money site for this offer straight into your
                Asset Vault — with <strong className="text-text-secondary">your</strong> affiliate
                link already woven in.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Your affiliate promo link</label>
              <div className="relative mt-1.5">
                <ClipboardPaste className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={affiliateLink}
                  onChange={(e) => { setAffiliateLink(e.target.value); if (error) setError(null); }}
                  placeholder="https://www.digistore24.com/redir/..."
                  className="input-base w-full pl-10"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            <button onClick={handleBuild} disabled={!affiliateLink.trim()} className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <Globe className="w-4 h-4" /> Get My Website
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function RecurringWealthPage() {
  const [built, setBuilt] = useState<Record<number, BuiltSite>>({});
  const [activeProduct, setActiveProduct] = useState<RecurringProduct | null>(null);

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-5xl mx-auto w-full">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 lg:p-12 text-center border border-[#D4AF37]/15">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-5">
          <Crown className="w-3.5 h-3.5" /> Society Access
        </div>
        <h1 className="brand-font text-3xl md:text-4xl text-text-heading tracking-tight mb-3">Recurring Wealth Streams</h1>
        <p className="text-text-muted text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Offers that pay you <span className="text-text-primary font-semibold">every month</span> for every customer you
          refer. Pick one and get a ready-made money site with tested-to-convert content dropped into
          your vault — with your own link.
        </p>
      </motion.div>

      {/* Product list */}
      <div className="flex flex-col gap-4">
        {RECURRING_PRODUCTS.map((product, index) => {
          const nc = NICHE_COLORS[product.niche] || DEFAULT_NC;
          const builtSite = built[product.id];
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5 md:p-6 flex flex-col gap-5"
            >
              <div className="flex items-start gap-4">
                <div className={clsx(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0",
                  product.rank <= 3 ? "bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]" : "bg-white/5 border border-white/10 text-text-muted"
                )}>
                  #{product.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-text-primary">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", nc)}>
                      {product.niche}
                    </span>
                    <span className="text-[10px] text-text-muted/70">Since {product.onlineSince}</span>
                  </div>
                </div>
                {builtSite && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-bold text-green-400 uppercase">Website ready</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Stat icon={DollarSign} label="Price" value={product.price} />
                <Stat icon={Percent} label="Commission" value={product.commission} valueClass="text-green-400" />
                <Stat icon={TrendingDown} label="Earn/Visitor" value={product.earningsPerVisitor} valueClass="text-accent" />
                <Stat icon={CreditCard} label="Payment" value={product.paymentType} small />
                {product.cartConversion !== "—" && <Stat icon={Users} label="Cart Conv." value={product.cartConversion} />}
                {product.cancellationRate !== "—" && <Stat icon={RefreshCw} label="Cancel Rate" value={product.cancellationRate} />}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-text-muted uppercase tracking-wider hover:bg-white/10 hover:text-text-heading transition-all">
                  <ExternalLink className="w-3.5 h-3.5" /> Check Product
                </a>
                {builtSite ? (
                  <Link href="/asset" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-400/10 border border-green-400/30 text-green-400 text-xs font-bold uppercase tracking-wider hover:bg-green-400/20 transition-all">
                    <Globe className="w-3.5 h-3.5" /> View in Vault <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button onClick={() => setActiveProduct(product)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider btn-primary">
                    <Globe className="w-3.5 h-3.5" /> Get Website — Tested-to-Convert Content
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeProduct && (
          <GetWebsitePopup
            product={activeProduct}
            onClose={() => setActiveProduct(null)}
            onBuilt={(slug) => setBuilt((prev) => ({ ...prev, [activeProduct.id]: { slug } }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  valueClass = "text-text-primary",
  small,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-black/30 px-3 py-2.5 rounded-lg border border-white/5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-text-muted" />
        <span className="text-[10px] text-text-muted uppercase">{label}</span>
      </div>
      <div className={clsx(small ? "text-xs" : "text-sm", "font-bold", valueClass)}>{value}</div>
    </div>
  );
}
