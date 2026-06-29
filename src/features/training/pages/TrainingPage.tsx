"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap, Play, MapPin, Link2, Rocket, Globe,
    ChevronDown, ChevronUp, ArrowRight, HelpCircle,
    CheckCircle2, Target, ShieldCheck, Repeat, Megaphone,
    BookOpen, Zap, DollarSign, Star, Sparkles
} from "lucide-react";
import { trainingContent } from "@/config/training.config";
import { brand } from "@/config/brand.config";

const VIDEOS = trainingContent.videos.filter((v) => v.id);

const STEPS_GUIDE = [
    {
        step: 1,
        title: "Choose Your Territory",
        icon: MapPin,
        description: "Pick the niche your money site will dominate. The system suggests specific, buyer-intent territories with real search demand — not vague one-word topics.",
        tips: [
            "Go narrow: \"metal detectors for beginners under $300\" beats \"metal detectors\"",
            "Pick a territory where people are actively researching a purchase",
            "Match the territory to an affiliate offer you can promote",
        ],
        examples: ["beginner metal detectors", "standing desks for small spaces", "budget espresso machines", "home sauna kits"],
    },
    {
        step: 2,
        title: "Arm Your Links",
        icon: Link2,
        description: "Paste your affiliate links (e.g. DigiStore24) into the Link Vault. These get woven naturally into your articles and into the call-to-action at the end of every post.",
        tips: [
            "Add at least one valid affiliate link before deploying",
            "Save multiple offers — your best link is woven into every article",
            "Links live in your Link Vault and are reused across all your sites",
        ],
        examples: [],
    },
    {
        step: 3,
        title: "Deploy Your Money Site",
        icon: Rocket,
        description: "One click generates a complete site: a pillar guide plus six cluster articles, hero images, SEO metadata, internal links, and your affiliate links woven in — then publishes it live.",
        tips: [
            "Each article is written for E-E-A-T and buyer intent, then interlinked",
            "Your affiliate link appears naturally in-content and as the closing CTA",
            "Images and SEO are handled automatically — no manual work",
        ],
        examples: [],
    },
    {
        step: 4,
        title: "Manage & Scale",
        icon: Globe,
        description: "Track your live sites in the Asset Vault, watch your affiliate clicks, and keep adding fresh offers to the Link Vault. Spin up new territories whenever you want more income streams.",
        tips: [
            "Check the Asset Vault for clicks and traffic on each site",
            "Add new offers to the Link Vault weekly to keep content fresh",
            "Deploy a new territory whenever you find a profitable angle",
        ],
        examples: [],
    },
];

const PREMIUM_TOOLS = [
    { icon: Rocket, title: "Accelerator", text: "Done-for-you campaign blueprints across five proven niches. Pick one, arm a matching affiliate link, and deploy it as a money site." },
    { icon: Repeat, title: "Recurring Wealth Streams", text: "Curated subscription offers that pay you every month for every customer you refer. Arm one to your Link Vault in a couple of clicks." },
    { icon: Megaphone, title: "Social Payouts", text: "Ready-to-post social content written as personal stories. Drop in your affiliate link once and every post is armed instantly." },
    { icon: ShieldCheck, title: "Wealth Protector", text: "Your real-time account security overview — verification, encryption, and access monitoring so your assets stay locked down." },
];

const FAQ_SECTIONS = [
    {
        title: "Getting Started",
        items: [
            {
                q: "How do I actually earn with this?",
                a: `${brand.productName} builds you SEO money sites that rank for buyer-intent searches. Each site is packed with helpful articles, and your affiliate link is woven naturally into the content and the closing call-to-action. When a reader clicks through and buys, you earn a commission. The Society Access tools (Accelerator, Recurring Wealth Streams, Social Payouts) give you extra ways to drive traffic and stack income.`,
            },
            {
                q: "Do I need any experience or technical skills?",
                a: "None. The system writes the articles, generates the images, handles the SEO, and weaves in your links automatically. Your job is to choose a territory, paste your affiliate link, and click deploy. If you can use a web browser, you can run this.",
            },
            {
                q: "What should I do first after logging in?",
                a: "Run the Extraction Protocol (Connect → Scan → Claim) to set up your account, then jump into Empire Builder: choose your territory, arm your affiliate links, and deploy your first money site. After that, explore the Society Access tools to add more income streams.",
            },
            {
                q: "Can I use this on my phone?",
                a: `Yes. ${brand.productName} works in any modern browser on desktop, tablet, or phone, so you can deploy sites and copy social posts from anywhere.`,
            },
        ],
    },
    {
        title: "Empire Builder (Your Money Sites)",
        items: [
            {
                q: "What exactly gets generated when I deploy?",
                a: "A complete, interlinked site: one comprehensive pillar guide plus six supporting cluster articles, each with a hero image, SEO title and meta description, internal links, and your affiliate link woven into the body and the closing CTA. It's published live on its own URL.",
            },
            {
                q: "How are my affiliate links used in the articles?",
                a: "Your primary offer is placed once as a natural, contextual in-content link and again as the call-to-action at the end of each article — with an honest affiliate disclosure at the top. This keeps the content trustworthy and compliant while still converting.",
            },
            {
                q: "What makes a good territory?",
                a: "Specific, buyer-intent niches with real search demand. Think a clear product category, a skill level, a price tier, or a use case — like \"budget espresso machines\" rather than just \"coffee\". The narrower and more purchase-focused, the easier it is to rank and convert.",
            },
            {
                q: "Where do I get affiliate links?",
                a: "From any affiliate network — we recommend DigiStore24. Create a free account, find a product that fits your territory, click Promote, and paste your unique link into the Link Vault.",
            },
        ],
    },
    {
        title: "Society Access (Premium Tools)",
        items: [
            {
                q: "What is the Accelerator?",
                a: "A library of done-for-you campaign blueprints across Health & Fitness, Personal Finance, Online Business, Weight Loss, and Self-Improvement. Each blueprint has a built-in angle and a list of recommended offers. Pick one, arm a matching affiliate link, and it's saved to your Link Vault ready to deploy.",
            },
            {
                q: "How do Recurring Wealth Streams work?",
                a: "It's a curated list of subscription offers that pay recurring commissions — you keep earning every month a referred customer stays subscribed. Pick an offer, grab your promo link from your affiliate network, and arm it straight to your Link Vault.",
            },
            {
                q: "How do I use Social Payouts?",
                a: "Choose a niche, paste your affiliate link once, and the tool inserts it into dozens of ready-to-post, story-style social posts. Copy any post and share it in relevant groups and feeds. Posts are written to blend in naturally rather than read like ads.",
            },
            {
                q: "What is the Wealth Protector?",
                a: "A real-time security dashboard for your account — it confirms your verification status, encryption, secure session, and access activity so you always know your assets and data are protected.",
            },
        ],
    },
    {
        title: "Strategy & Scaling",
        items: [
            {
                q: "What's the best strategy to maximize income?",
                a: "Stack the system: (1) Deploy several money sites across different buyer-intent territories. (2) Use the Accelerator blueprints to launch faster. (3) Arm Recurring Wealth offers so commissions compound monthly. (4) Drive extra traffic with Social Payouts. The more armed links and live sites you have, the more chances to earn.",
            },
            {
                q: "Should I promote high-ticket or low-ticket offers?",
                a: "Higher-commission offers are almost always better — one $50–$100 commission beats dozens of tiny ones. Recurring offers are especially powerful because they pay you every month, not just once.",
            },
            {
                q: "How often should I add new content?",
                a: "Deploy new territories regularly and add fresh offers to your Link Vault weekly. Search engines reward sites that stay current, and more live content means more entry points for buyers to find you.",
            },
        ],
    },
];

const PRO_TIPS = [
    { icon: Target, title: "Go narrow on territory", text: "Specific buyer-intent niches rank faster and convert better than broad topics. Niche down." },
    { icon: DollarSign, title: "Favor recurring offers", text: "Offers that pay every month compound your income. Arm a few from Recurring Wealth Streams." },
    { icon: Rocket, title: "Launch with blueprints", text: "Use Accelerator blueprints to skip the guesswork and deploy proven angles instantly." },
    { icon: Megaphone, title: "Stack free traffic", text: "Drop your link into Social Payouts and post daily to send extra traffic to your sites." },
    { icon: Link2, title: "Keep the Vault full", text: "Add new offers to your Link Vault weekly so every deploy has fresh links to weave in." },
    { icon: Star, title: "Deploy more territories", text: "Each new money site is another income stream. Volume of quality sites wins." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-border-dim/20 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/3 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <HelpCircle size={15} className="text-accent shrink-0" />
                    <span className="text-sm font-semibold text-text-primary">{q}</span>
                </div>
                {open ? <ChevronUp size={14} className="text-text-muted shrink-0" /> : <ChevronDown size={14} className="text-text-muted shrink-0" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pl-12">
                            <p className="text-[13px] text-text-secondary leading-relaxed">{a}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function TrainingPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-12 max-w-5xl mx-auto w-full py-6"
        >
            {/* Header */}
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center rounded-lg">
                        <GraduationCap size={20} className="text-accent" />
                    </div>
                    <div>
                        <h1 className="brand-font text-2xl text-text-heading tracking-tight">{trainingContent.pageTitle}</h1>
                        <p className="text-sm text-text-muted">{trainingContent.pageSubtitle}</p>
                    </div>
                </div>
            </header>

            {/* Video Training */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <Play size={16} className="text-accent" />
                    <h2 className="text-lg font-bold text-text-heading">Video Training</h2>
                </div>

                {VIDEOS.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {VIDEOS.map((video, i) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card overflow-hidden"
                            >
                                <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
                                    <iframe
                                        src={`https://player.vimeo.com/video/${video.id}?badge=0&autopause=0&player_id=0&app_id=58479`}
                                        className="absolute inset-0 w-full h-full"
                                        frameBorder="0"
                                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                                        allowFullScreen
                                        title={video.title}
                                    />
                                </div>
                                <div className="p-4 flex flex-col gap-1.5">
                                    <span className="text-[9px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded self-start">
                                        Video {i + 1}
                                    </span>
                                    <h3 className="text-sm font-bold text-text-heading">{video.title}</h3>
                                    <p className="text-[12px] text-text-muted leading-relaxed">{video.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-8 text-center">
                        <p className="text-sm text-text-muted">
                            Society training videos are being prepared. Check back soon for Extraction Protocol and
                            Empire Builder walkthroughs.
                        </p>
                    </div>
                )}
            </section>

            {/* Step-by-Step Guide */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-accent" />
                    <h2 className="text-lg font-bold text-text-heading">Empire Builder — Step by Step</h2>
                </div>

                <div className="flex flex-col gap-4">
                    {STEPS_GUIDE.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={s.step}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="glass-card p-5 flex flex-col gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center shrink-0">
                                        <Icon size={18} className="text-accent" />
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Step {s.step}</span>
                                        <h3 className="text-base font-bold text-text-heading">{s.title}</h3>
                                        <p className="text-[13px] text-text-secondary leading-relaxed">{s.description}</p>
                                    </div>
                                </div>

                                <div className="pl-14 flex flex-col gap-3">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tips</p>
                                    <div className="flex flex-col gap-2">
                                        {s.tips.map((tip, j) => (
                                            <div key={j} className="flex items-start gap-2">
                                                <CheckCircle2 size={12} className="text-green-400 shrink-0 mt-0.5" />
                                                <span className="text-[12px] text-text-secondary leading-relaxed">{tip}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {s.examples.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Try:</span>
                                            {s.examples.map((ex, j) => (
                                                <span key={j} className="text-[11px] px-2.5 py-1 bg-accent/5 border border-accent/15 rounded-md text-accent font-medium">
                                                    {ex}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Society Access tools */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#D4AF37]" />
                    <h2 className="text-lg font-bold text-text-heading">Society Access — Premium Tools</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PREMIUM_TOOLS.map((tool, i) => {
                        const Icon = tool.icon;
                        return (
                            <motion.div
                                key={tool.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="glass-card p-5 flex flex-col gap-2.5"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg flex items-center justify-center shrink-0">
                                        <Icon size={16} className="text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-sm font-bold text-text-heading">{tool.title}</h3>
                                </div>
                                <p className="text-[12px] text-text-muted leading-relaxed">{tool.text}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Pro Tips */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-accent" />
                    <h2 className="text-lg font-bold text-text-heading">Pro Tips for More Earnings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PRO_TIPS.map((tip, i) => {
                        const Icon = tip.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="glass-card p-4 flex flex-col gap-2.5"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Icon size={15} className="text-accent" />
                                    </div>
                                    <h3 className="text-[13px] font-bold text-text-heading">{tip.title}</h3>
                                </div>
                                <p className="text-[12px] text-text-muted leading-relaxed">{tip.text}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Quick Start Checklist */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <h2 className="text-lg font-bold text-text-heading">Quick Start Checklist</h2>
                </div>

                <div className="border border-green-500/15 rounded-xl bg-green-500/3 p-5 flex flex-col gap-3">
                    {[
                        "Run the Extraction Protocol (Connect → Scan → Claim)",
                        "Choose your territory in Empire Builder Click 1",
                        "Arm 2–3 affiliate links in Click 2",
                        "Deploy your money site in Click 3",
                        "Arm a recurring offer from Recurring Wealth Streams",
                        "Post daily with Social Payouts to drive free traffic",
                        "Check the Asset Vault for clicks and add offers weekly",
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-md border border-green-500/20 bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[9px] font-black text-green-400">{i + 1}</span>
                            </div>
                            <span className="text-[13px] text-text-secondary leading-relaxed">{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="flex flex-col gap-8">
                <div className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-accent" />
                    <h2 className="text-lg font-bold text-text-heading">Frequently Asked Questions</h2>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-2">{FAQ_SECTIONS.reduce((acc, s) => acc + s.items.length, 0)} answers</span>
                </div>

                <div className="flex flex-col gap-6">
                    {FAQ_SECTIONS.map((section, si) => (
                        <div key={si} className="flex flex-col gap-2">
                            <h3 className="text-[11px] font-bold text-accent uppercase tracking-[0.15em] px-1 mb-1">{section.title}</h3>
                            {section.items.map((item, i) => (
                                <FAQItem key={`${si}-${i}`} q={item.q} a={item.a} />
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="border border-accent/20 rounded-xl bg-accent/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-base font-bold text-text-heading">Ready to build your cash asset?</h3>
                    <p className="text-[13px] text-text-muted">Start Empire Builder — choose your territory first.</p>
                </div>
                <a
                    href="/territory"
                    className="btn-primary h-11 px-6 text-sm rounded-lg flex items-center gap-2 shrink-0"
                >
                    <MapPin size={16} />
                    <span>Choose Territory</span>
                    <ArrowRight size={14} />
                </a>
            </section>
        </motion.div>
    );
}
