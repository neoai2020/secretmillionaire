"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  RefreshCw,
  Rocket,
  Crown,
  ExternalLink,
  X,
  Copy,
  Check,
  CheckCircle2,
  Loader2,
  Search,
  ClipboardPaste,
  DollarSign,
  Percent,
  Users,
  CreditCard,
  TrendingDown,
} from "lucide-react";
import { saveToLinkVault } from "@/lib/save-to-link-vault";
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

const MARKETPLACE_URL =
  "https://www.digistore24-app.com/app/en/affiliate/account/marketplace/all";

function SyncPopup({
  product,
  onClose,
  onSynced,
}: {
  product: RecurringProduct;
  onClose: () => void;
  onSynced: () => void;
}) {
  const [promoLink, setPromoLink] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyName = () => {
    navigator.clipboard.writeText(product.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async () => {
    if (!promoLink.trim()) return;
    setSyncing(true);
    setError(null);
    const ok = await saveToLinkVault(product.name, promoLink.trim());
    setSyncing(false);
    if (ok) {
      onSynced();
      onClose();
    } else {
      setError("Could not save to your Link Vault. Check the link starts with https:// and try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass-card p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-text-heading hover:bg-white/10 transition-all">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="brand-font text-xl text-text-heading mb-1">Arm: {product.name}</h2>
            <p className="text-sm text-text-muted">Grab your affiliate promo link, then save it straight to your Link Vault.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border bg-[#45A29E]/5 border-[#45A29E]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-accent/20 text-accent">1</div>
                <span className="text-sm font-bold text-text-primary">Copy the product name</span>
              </div>
              <div className="flex items-center gap-2 ml-10">
                <div className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-text-secondary truncate">{product.name}</div>
                <button onClick={handleCopyName} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 text-xs font-bold text-accent hover:bg-accent/20 transition-all shrink-0">
                  {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-[#45A29E]/5 border-[#45A29E]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-accent/20 text-accent">2</div>
                <span className="text-sm font-bold text-text-primary">Find it in your affiliate network</span>
              </div>
              <div className="ml-10 space-y-2">
                <p className="text-xs text-text-muted leading-relaxed">
                  Open the DigiStore24 marketplace, search the product name, and click <strong className="text-text-primary">&quot;Promote&quot;</strong> to get your unique link.
                </p>
                <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-text-secondary hover:text-text-heading hover:bg-white/10 transition-all">
                  <Search className="w-3 h-3" /> Open Marketplace <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-[#45A29E]/5 border-[#45A29E]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className={clsx("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", promoLink.trim() ? "bg-green-500/20 text-green-400" : "bg-accent/20 text-accent")}>
                  {promoLink.trim() ? <Check className="w-4 h-4" /> : "3"}
                </div>
                <span className="text-sm font-bold text-text-primary">Paste your promo link</span>
              </div>
              <div className="ml-10 relative">
                <ClipboardPaste className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={promoLink}
                  onChange={(e) => { setPromoLink(e.target.value); if (error) setError(null); }}
                  placeholder="https://www.digistore24.com/redir/..."
                  className="input-base w-full pl-10"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          <button
            onClick={handleSync}
            disabled={!promoLink.trim() || syncing}
            className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Rocket className="w-4 h-4" /> Save to Link Vault</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function RecurringWealthPage() {
  const [syncedIds, setSyncedIds] = useState<Set<number>>(new Set());
  const [syncProduct, setSyncProduct] = useState<RecurringProduct | null>(null);

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-5xl mx-auto w-full">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 lg:p-12 text-center border border-[#D4AF37]/15">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-5">
          <Crown className="w-3.5 h-3.5" /> Society Access
        </div>
        <h1 className="brand-font text-3xl md:text-4xl text-text-heading tracking-tight mb-3">
          Recurring Wealth Streams
        </h1>
        <p className="text-text-muted text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Hand-picked offers that pay you <span className="text-text-primary font-semibold">every single month</span> for every
          customer you refer. Arm one to your Link Vault and let your money sites do the rest.
        </p>
      </motion.div>

      {/* Product list */}
      <div className="flex flex-col gap-4">
        {RECURRING_PRODUCTS.map((product, index) => {
          const nc = NICHE_COLORS[product.niche] || DEFAULT_NC;
          const isSynced = syncedIds.has(product.id);
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
                {isSynced && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-bold text-green-400 uppercase">Armed</span>
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
                <button
                  onClick={() => setSyncProduct(product)}
                  disabled={isSynced}
                  className={clsx(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                    isSynced ? "bg-green-400/10 border border-green-400/30 text-green-400 cursor-default" : "btn-primary"
                  )}
                >
                  {isSynced ? <><CheckCircle2 className="w-3.5 h-3.5" /> Armed</> : <><Rocket className="w-3.5 h-3.5" /> Arm This Offer</>}
                </button>
                <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-text-muted uppercase tracking-wider hover:bg-white/10 hover:text-text-heading transition-all">
                  <ExternalLink className="w-3.5 h-3.5" /> Check Offer
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {syncProduct && (
          <SyncPopup
            product={syncProduct}
            onClose={() => setSyncProduct(null)}
            onSynced={() => setSyncedIds((prev) => new Set(prev).add(syncProduct.id))}
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
