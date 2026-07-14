import { brand } from "./brand.config";

export type TrainingIconId =
  | "mapPin"
  | "link2"
  | "rocket"
  | "globe"
  | "wifi"
  | "activity"
  | "wallet"
  | "shieldCheck"
  | "repeat"
  | "megaphone"
  | "target"
  | "dollarSign"
  | "star"
  | "zap"
  | "sparkles"
  | "bookOpen";

export interface TrainingStep {
  step: number;
  title: string;
  icon: TrainingIconId;
  description: string;
  tips: string[];
  examples?: string[];
  href?: string;
}

export interface TrainingToolCard {
  title: string;
  icon: TrainingIconId;
  text: string;
  href: string;
}

export interface TrainingTip {
  title: string;
  icon: TrainingIconId;
  text: string;
}

export interface TrainingFaqItem {
  q: string;
  a: string;
}

export interface TrainingFaqSection {
  title: string;
  items: TrainingFaqItem[];
}

export interface TrainingPath {
  title: string;
  subtitle: string;
  icon: TrainingIconId;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
}

const product = brand.productName;

/** Full training copy — edit here; UI lives in `features/training/`. */
export const trainingContentData = {
  intro: {
    headline: "How the Society Works",
    body: `${product} gives you two ways to launch SEO money sites that rank for buyer-intent searches and weave in your affiliate links. Run Activation once from your dashboard, then choose your path: build a custom territory site in Empire Builder, or clone a tested 25-article site from Recurring Wealth Streams.`,
  },

  paths: [
    {
      title: "Empire Builder — Custom Territory Site",
      subtitle: "You pick the niche. We generate 7 interlinked articles (1 pillar + 6 clusters), images, SEO, and your affiliate CTA — then publish live.",
      icon: "rocket" as TrainingIconId,
      bullets: [
        "Best when you already know a profitable buyer-intent angle",
        "Territory → Arm Links → Deploy in three clicks",
        "Manage everything in Asset Vault and Link Vault",
      ],
      ctaLabel: "Choose Territory",
      ctaHref: "/territory",
    },
    {
      title: "Recurring Wealth — Pre-Built 25-Article Site",
      subtitle: "Pick a curated subscription offer. Click Get Website and we clone a fully written, imaged, tested-to-convert template into your vault — with your affiliate link swapped in.",
      icon: "repeat" as TrainingIconId,
      bullets: [
        "Fastest path — skip writing and go live in minutes",
        "25 SEO articles per offer, already interlinked",
        "Ideal for recurring-commission offers that pay monthly",
      ],
      ctaLabel: "Browse Recurring Offers",
      ctaHref: "/recurring-wealth",
    },
  ] satisfies TrainingPath[],

  extractionSteps: [
    {
      step: 1,
      title: "Connect",
      icon: "wifi" as TrainingIconId,
      description: "Hit Begin Activation on your dashboard — the console links you to the Society's private network.",
      tips: ["Complete this once after signup", "The whole activation takes about 30 seconds"],
      href: "/dashboard",
    },
    {
      step: 2,
      title: "Scan",
      icon: "activity" as TrainingIconId,
      description: "The console scans live affiliate platforms for commission opportunities and maps your daily earning target.",
      tips: ["Runs automatically right after Connect", "Your target is a goal, not a balance — you earn it through your links"],
      href: "/dashboard",
    },
    {
      step: 3,
      title: "Lock Your Target",
      icon: "wallet" as TrainingIconId,
      description: "Lock in your daily earning target so your dashboard, vaults, and deploy tools are fully armed.",
      tips: ["Complete activation before your first deploy", "You can revisit your dashboard anytime from the sidebar"],
      href: "/dashboard",
    },
  ] satisfies TrainingStep[],

  empireBuilderSteps: [
    {
      step: 1,
      title: "Choose Your Territory",
      icon: "mapPin",
      description:
        "Pick a specific, buyer-intent niche — the exact angle your money site will rank for. The system suggests territories with real search demand, not vague one-word topics.",
      tips: [
        "Go narrow: \"standing desks for small apartments\" beats \"furniture\"",
        "Match the territory to an affiliate offer you can promote",
        "Buyer-intent beats traffic for its own sake — people ready to purchase convert best",
      ],
      examples: [
        "beginner metal detectors under $300",
        "budget espresso machines",
        "home sauna kits for small spaces",
        "dog training for reactive breeds",
      ],
      href: "/territory",
    },
    {
      step: 2,
      title: "Arm Your Links",
      icon: "link2",
      description:
        "Paste affiliate links (e.g. from DigiStore24) into the Link Vault. Your primary offer is woven naturally into every article and the closing call-to-action.",
      tips: [
        "Add at least one valid https affiliate link before deploying",
        "Save multiple offers — the best link is used across your cluster",
        "Links persist in Link Vault for every future site you deploy",
      ],
      href: "/arm-links",
    },
    {
      step: 3,
      title: "Deploy Your Money Site",
      icon: "rocket",
      description:
        "One click generates a complete site: a pillar guide plus six supporting articles, hero images, SEO metadata, internal links, and affiliate CTAs — then publishes it live.",
      tips: [
        "Each article targets E-E-A-T and commercial search intent",
        "One contextual in-content link plus an end CTA per post (with disclosure)",
        "Images and SEO are handled automatically",
      ],
      href: "/deploy",
    },
    {
      step: 4,
      title: "Manage & Scale",
      icon: "globe",
      description:
        "Track live sites in Asset Vault, monitor affiliate clicks, and spin up new territories or Recurring Wealth clones whenever you want another income stream.",
      tips: [
        "Asset Vault shows each live site and its performance",
        "Refresh Link Vault weekly with new offers",
        "Stack multiple sites — volume of quality assets wins",
      ],
      href: "/asset",
    },
  ] satisfies TrainingStep[],

  premiumTools: [
    {
      title: "Accelerator",
      icon: "rocket",
      text: "Done-for-you campaign blueprints across five proven niches. Arm a matching affiliate link and deploy as a money site.",
      href: "/accelerator",
    },
    {
      title: "Recurring Wealth Streams",
      icon: "repeat",
      text: "Curated subscription offers with tested 25-article template sites. Get Website clones the full site with your link in one flow.",
      href: "/recurring-wealth",
    },
    {
      title: "Social Payouts",
      icon: "megaphone",
      text: "Story-style social posts ready to copy. Paste your link once — every post in your chosen niche is armed instantly.",
      href: "/social-payouts",
    },
    {
      title: "Wealth Protector",
      icon: "shieldCheck",
      text: "Account security overview — verification, encryption, and session monitoring so your assets stay protected.",
      href: "/protector",
    },
  ] satisfies TrainingToolCard[],

  proTips: [
    {
      icon: "target",
      title: "Niche beats broad",
      text: "Specific buyer-intent territories rank faster and convert better than generic topics.",
    },
    {
      icon: "repeat",
      title: "Use Recurring Wealth for speed",
      text: "When you want a full 25-post site without waiting on generation, clone a template from Recurring Wealth.",
    },
    {
      icon: "dollarSign",
      title: "Favor recurring commissions",
      text: "Offers that pay every month compound income. Arm several from Recurring Wealth Streams.",
    },
    {
      icon: "megaphone",
      title: "Stack free traffic",
      text: "Social Payouts gives you daily post copy — share in groups and send traffic to your live sites.",
    },
    {
      icon: "link2",
      title: "Keep Link Vault current",
      text: "Add fresh offers weekly so every deploy weaves in links you actually want to promote.",
    },
    {
      icon: "star",
      title: "Deploy more assets",
      text: "Each live money site is another entry point. Custom territories plus Recurring clones multiply your reach.",
    },
  ] satisfies TrainingTip[],

  quickStartChecklist: [
    "Complete Activation: Connect → Scan → Lock Your Target",
    "Path A: Choose territory → Arm links → Deploy (7-article site)",
    "Path B: Recurring Wealth → pick offer → Get Website (25-article clone)",
    "Arm a recurring offer link even if you started with Empire Builder",
    "Post daily with Social Payouts to drive free traffic",
    "Review Asset Vault for clicks; add new offers to Link Vault weekly",
  ],

  faqSections: [
    {
      title: "Getting Started",
      items: [
        {
          q: "How do I earn with this?",
          a: `${product} publishes SEO money sites packed with buyer-intent articles. Your affiliate link appears in-content and in the closing CTA. When a reader buys through your link, you earn commission. Stack Empire Builder sites, Recurring Wealth clones, Accelerator blueprints, and Social Payouts for more traffic and offers.`,
        },
        {
          q: "Do I need technical skills?",
          a: "No. The system writes articles, generates images, handles SEO, and weaves links. You choose a territory or recurring offer, paste affiliate links, and deploy. If you can use a browser, you can run this.",
        },
        {
          q: "What should I do first after login?",
          a: "Finish Activation on your dashboard (Connect → Scan → Lock Your Target), then either start Empire Builder at Choose Territory or open Recurring Wealth and click Get Website on an offer you like.",
        },
        {
          q: "Can I use this on mobile?",
          a: `Yes. ${product} works in any modern mobile browser — deploy sites, arm links, and copy social posts from your phone.`,
        },
      ],
    },
    {
      title: "Empire Builder",
      items: [
        {
          q: "What gets generated when I deploy?",
          a: "A live, interlinked site: one pillar guide plus six cluster articles. Each post includes a hero image, SEO title and meta description, internal links, affiliate disclosure, in-content recommendation link, and closing CTA.",
        },
        {
          q: "How are affiliate links used?",
          a: "Your primary Link Vault offer is placed once naturally in the body (after the first major section) and again as the end CTA. This keeps content trustworthy and compliant while still converting.",
        },
        {
          q: "What makes a good territory?",
          a: "Specific niches where people are researching a purchase — product category + use case, skill level, or budget tier. \"Budget espresso machines for apartments\" outperforms \"coffee\" every time.",
        },
        {
          q: "Where do I get affiliate links?",
          a: "DigiStore24 and similar networks. Create a free account, find a product that fits your territory, click Promote, and paste your tracking link into Link Vault.",
        },
      ],
    },
    {
      title: "Recurring Wealth & Templates",
      items: [
        {
          q: "What does Get Website do?",
          a: "It clones a pre-seeded 25-article template site for that recurring offer into your Asset Vault, swaps in your affiliate link across all posts, and publishes it live. Content is API-generated, buyer-focused, and already interlinked.",
        },
        {
          q: "Empire Builder vs Recurring Wealth — which should I use?",
          a: "Use Empire Builder when you want a custom niche you picked yourself (7 articles, fast deploy). Use Recurring Wealth when you want a full 25-post site around a proven subscription offer without writing anything.",
        },
        {
          q: "Can I use both?",
          a: "Yes — that's the recommended stack. Deploy custom territories for angles you discover, and clone Recurring templates for offers that pay monthly commissions.",
        },
      ],
    },
    {
      title: "Society Access Tools",
      items: [
        {
          q: "What is the Accelerator?",
          a: "Fifteen done-for-you campaign blueprints across five niches. Each includes an angle and recommended offers. Arm a link and save it to Link Vault for your next deploy.",
        },
        {
          q: "How does Social Payouts work?",
          a: "Choose a niche, paste your affiliate link once, and copy story-style posts written to feel personal — not like ads. Share them in social feeds and groups to send traffic to your sites.",
        },
        {
          q: "What is Wealth Protector?",
          a: "A security dashboard showing verification status, encryption, and session activity for your Initiate account.",
        },
      ],
    },
    {
      title: "Strategy & Scaling",
      items: [
        {
          q: "Best strategy to maximize income?",
          a: "Complete Extraction, deploy at least one Empire Builder site, clone one Recurring Wealth template, arm Social Payouts for daily traffic, and add new offers to Link Vault every week. More armed links and live sites = more chances to earn.",
        },
        {
          q: "High-ticket or low-ticket offers?",
          a: "Higher commissions usually win per sale. Recurring subscription offers are especially powerful because they pay monthly, not once.",
        },
        {
          q: "How often should I add new sites?",
          a: "Deploy new territories or Recurring clones regularly. Search engines favor fresh, focused content — and each site is another doorway for buyers to find you.",
        },
      ],
    },
  ] satisfies TrainingFaqSection[],

  cta: {
    title: "Ready to deploy your first asset?",
    subtitle: "Start with a territory you know, or clone a Recurring Wealth site in one click.",
    primaryLabel: "Choose Territory",
    primaryHref: "/territory",
    secondaryLabel: "Recurring Wealth",
    secondaryHref: "/recurring-wealth",
  },

  videoPlaceholder:
    "Member walkthrough videos are being prepared. Until then, follow the step guides below — they cover Activation, Empire Builder, and Recurring Wealth Get Website.",
} as const;
