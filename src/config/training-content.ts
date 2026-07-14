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
    body: `${product} gives you two ways to get a website that recommends products and pays you when people buy. Start from your Home dashboard, then either build your own website (3 simple steps), or copy a ready-made 25-article website from Recurring Wealth.`,
  },

  paths: [
    {
      title: "Build Your Own Website",
      subtitle: "You pick a topic. We write 7 helpful articles, add pictures, put in your product links, and put the website online.",
      icon: "rocket" as TrainingIconId,
      bullets: [
        "Best when you already know a topic you enjoy",
        "Pick topic → Add links → Launch website",
        "Find everything later in My Websites and Link Vault",
      ],
      ctaLabel: "Pick Your Topic",
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
      description: "Lock in your daily earning goal so your account is ready to build websites.",
      tips: ["Finish this before you launch your first website", "You can reopen Home anytime from the sidebar"],
      href: "/dashboard",
    },
  ] satisfies TrainingStep[],

  empireBuilderSteps: [
    {
      step: 1,
      title: "Pick Your Topic",
      icon: "mapPin",
      description:
        "Choose what your website will be about. Pick something people search for and buy — we suggest good ideas based on a hobby you enjoy.",
      tips: [
        "Go specific: \"standing desks for small apartments\" beats \"furniture\"",
        "Match the topic to a product you can recommend",
        "Topics with people ready to buy work better than vague interests",
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
      title: "Add Your Links",
      icon: "link2",
      description:
        "Paste your DigiStore24 (or other) product links. We place them naturally in every article so you get paid when readers buy.",
      tips: [
        "Add at least one valid https product link before launching",
        "You can save more than one — we use your chosen links in the articles",
        "Links stay saved in Link Vault for future websites",
      ],
      href: "/arm-links",
    },
    {
      step: 3,
      title: "Launch Your Website",
      icon: "rocket",
      description:
        "One click builds a complete website: a main guide plus six helpful articles, pictures, and your product links — then puts it online.",
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
        "See your live websites in My Websites, check how many people clicked your product links, and launch another site anytime you want.",
      tips: [
        "My Websites shows each live website and its clicks",
        "Update Link Vault weekly with new product links",
        "More good websites usually means more chances to earn",
      ],
      href: "/asset",
    },
  ] satisfies TrainingStep[],

  premiumTools: [
    {
      title: "Accelerator",
      icon: "rocket",
      text: "Ready-made campaign ideas for five popular topics. Pick one, add your product link, and launch a website.",
      href: "/accelerator",
    },
    {
      title: "Recurring Wealth Streams",
      icon: "repeat",
      text: "Ready-made 25-article websites for subscription products. Click Get Website and we copy one into your account with your link.",
      href: "/recurring-wealth",
    },
    {
      title: "Social Payouts",
      icon: "megaphone",
      text: "Ready-to-copy social posts. Paste your product link once, then share posts that send people to your website.",
      href: "/social-payouts",
    },
    {
      title: "Wealth Protector",
      icon: "shieldCheck",
      text: "A simple security check for your account — so you can see that your login and sessions are protected.",
      href: "/protector",
    },
  ] satisfies TrainingToolCard[],

  proTips: [
    {
      icon: "target",
      title: "Specific beats broad",
      text: "A clear topic people already want to buy ranks and converts better than something vague.",
    },
    {
      icon: "repeat",
      title: "Use Recurring Wealth for speed",
      text: "Want a 25-article website without waiting? Copy a ready-made one from Recurring Wealth.",
    },
    {
      icon: "dollarSign",
      title: "Prefer monthly commissions",
      text: "Products that pay you every month can grow income better than one-time sales.",
    },
    {
      icon: "megaphone",
      title: "Share free posts",
      text: "Social Payouts gives you daily post copy — share in groups and send visitors to your websites.",
    },
    {
      icon: "link2",
      title: "Keep Link Vault current",
      text: "Add fresh product links weekly so new websites use products you still want to recommend.",
    },
    {
      icon: "star",
      title: "Launch more websites",
      text: "Each live website is another way for buyers to find you. Build your own topics and copy Recurring websites as you grow.",
    },
  ] satisfies TrainingTip[],

  quickStartChecklist: [
    "Open Home and finish the short setup if asked",
    "Path A: Pick topic → Add links → Launch website (7 articles)",
    "Path B: Recurring Wealth → pick offer → Get Website (25 articles)",
    "Add a product link even if you started with Path A",
    "Post daily with Social Payouts to send free visitors",
    "Check My Websites for clicks; add new links to Link Vault weekly",
  ],

  faqSections: [
    {
      title: "Getting Started",
      items: [
        {
          q: "How do I earn with this?",
          a: `${product} puts your own websites online with helpful articles and your product links inside. When a reader buys through your link, you earn a commission. You can build your own site, copy a Recurring Wealth site, use Accelerator ideas, and share Social Payouts posts for free visitors.`,
        },
        {
          q: "Do I need technical skills?",
          a: "No. The system writes articles, adds pictures, and puts in your links. You pick a topic or a ready-made offer, paste product links, and launch. If you can use a browser, you can run this.",
        },
        {
          q: "What should I do first after login?",
          a: "Open Home on your dashboard. If asked, finish the short setup. Then either start Step 1 (Pick Your Topic) or open Recurring Wealth and click Get Website on an offer you like.",
        },
        {
          q: "Can I use this on mobile?",
          a: `Yes. ${product} works in any modern phone browser — launch websites, add links, and copy social posts from your phone.`,
        },
      ],
    },
    {
      title: "Build Your Website",
      items: [
        {
          q: "What do I get when I launch a website?",
          a: "A live website with one main guide plus six helpful articles. Each article has a picture, a clear title, your product link, and a short note that you may earn a commission.",
        },
        {
          q: "How are product links used?",
          a: "Your chosen Link Vault link is placed once in the article body and again at the end. That keeps the writing helpful while still giving readers a clear way to buy.",
        },
        {
          q: "What makes a good topic?",
          a: "Something specific people are already thinking of buying — product type plus use case, skill level, or budget. \"Budget espresso machines for apartments\" works better than \"coffee.\"",
        },
        {
          q: "Where do I get product links?",
          a: "DigiStore24 and similar networks. Create a free account, find a product that fits your topic, click Promote, and paste your tracking link into Link Vault.",
        },
      ],
    },
    {
      title: "Recurring Wealth & Templates",
      items: [
        {
          q: "What does Get Website do?",
          a: "It copies a ready-made 25-article website for that offer into My Websites, puts your product link into the articles, and puts the site online.",
        },
        {
          q: "Build Your Own vs Recurring Wealth — which should I use?",
          a: "Build your own when you want a topic you picked yourself (7 articles). Use Recurring Wealth when you want a full 25-article website around a subscription offer without writing anything.",
        },
        {
          q: "Can I use both?",
          a: "Yes — that is the best approach. Build your own topics you discover, and copy Recurring websites for offers that pay monthly commissions.",
        },
      ],
    },
    {
      title: "Society Access Tools",
      items: [
        {
          q: "What is the Accelerator?",
          a: "Fifteen ready-made campaign ideas across five topics. Each one suggests an angle and products. Add a link to Link Vault for your next website.",
        },
        {
          q: "How does Social Payouts work?",
          a: "Choose a topic, paste your product link once, and copy story-style posts that sound personal — not like ads. Share them online to send visitors to your websites.",
        },
        {
          q: "What is Wealth Protector?",
          a: "A simple security page that shows whether your account and sessions look protected.",
        },
      ],
    },
    {
      title: "Strategy & Scaling",
      items: [
        {
          q: "Best strategy to maximize income?",
          a: "Finish Home setup, launch at least one of your own websites, copy one Recurring Wealth website, use Social Payouts for daily visitors, and add new product links every week. More good websites and links usually means more chances to earn.",
        },
        {
          q: "High-ticket or low-ticket offers?",
          a: "Higher commissions usually win per sale. Subscription offers are especially useful because they can pay monthly, not just once.",
        },
        {
          q: "How often should I add new sites?",
          a: "Launch new topics or Recurring websites regularly. Search engines like fresh, focused pages — and each website is another doorway for buyers to find you.",
        },
      ],
    },
  ] satisfies TrainingFaqSection[],

  cta: {
    title: "Ready to launch your first website?",
    subtitle: "Start with a topic you know, or copy a Recurring Wealth website in one click.",
    primaryLabel: "Pick Your Topic",
    primaryHref: "/territory",
    secondaryLabel: "Recurring Wealth",
    secondaryHref: "/recurring-wealth",
  },

  videoPlaceholder:
    "Member walkthrough videos are being prepared. Until then, follow the step guides below — they cover Home setup, building your website, and Recurring Wealth Get Website.",
} as const;
