export interface AcceleratorTemplate {
  id: number;
  niche: string;
  name: string;
  angle: string;
  description: string;
  recommendedProducts: string[];
}

export const ACCELERATOR_NICHES = [
  "Health & Fitness",
  "Personal Finance",
  "Online Business",
  "Weight Loss",
  "Self-Improvement",
] as const;

/** Done-for-you campaign blueprints — pick one, arm your link, deploy. */
export const ACCELERATOR_TEMPLATES: AcceleratorTemplate[] = [
  // Health & Fitness
  { id: 1, niche: "Health & Fitness", name: "Mobility After 40", angle: "Problem → solution story", description: "A relatable hook about stiff joints and low energy that funnels readers toward a daily mobility supplement.", recommendedProducts: ["Joint health supplements", "Mobility programs"] },
  { id: 2, niche: "Health & Fitness", name: "The 10-Minute Home Workout", angle: "Quick-win listicle", description: "No-equipment routine framed for busy people, with gear and program recommendations woven in.", recommendedProducts: ["Resistance bands", "Home fitness programs"] },
  { id: 3, niche: "Health & Fitness", name: "Sleep Like a Pro", angle: "Authority guide", description: "Evidence-style breakdown of sleep optimization that recommends a sleep stack and tracker.", recommendedProducts: ["Sleep supplements", "Recovery devices"] },

  // Personal Finance
  { id: 4, niche: "Personal Finance", name: "Debt-Free in 12 Months", angle: "Transformation roadmap", description: "Step-by-step payoff plan that points readers to a budgeting system as the shortcut.", recommendedProducts: ["Budgeting apps", "Debt payoff courses"] },
  { id: 5, niche: "Personal Finance", name: "First $1k Investing", angle: "Beginner walkthrough", description: "Plain-English intro to getting started, recommending a starter platform and course.", recommendedProducts: ["Investing courses", "Robo-advisors"] },
  { id: 6, niche: "Personal Finance", name: "Side Income Stack", angle: "Comparison roundup", description: "Ranks realistic side-income paths and slots an affiliate course as the top pick.", recommendedProducts: ["Side-hustle courses", "Freelance tools"] },

  // Online Business
  { id: 7, niche: "Online Business", name: "Launch Your First Funnel", angle: "How-to authority piece", description: "Walks a beginner through a simple funnel and recommends the software to build it.", recommendedProducts: ["Funnel builders", "Email autoresponders"] },
  { id: 8, niche: "Online Business", name: "AI Tools That Pay", angle: "Trending listicle", description: "Roundup of AI tools for solo founders with recurring-commission picks featured.", recommendedProducts: ["AI writing tools", "Automation software"] },
  { id: 9, niche: "Online Business", name: "From Zero to First Sale", angle: "Case-study narrative", description: "A 'how I got my first sale' story that recommends the exact stack used.", recommendedProducts: ["Course platforms", "Affiliate training"] },

  // Weight Loss
  { id: 10, niche: "Weight Loss", name: "Stubborn Belly Fat Fix", angle: "Pain-point hook", description: "Empathetic angle on plateaus that recommends a metabolism support product.", recommendedProducts: ["Metabolism supplements", "Meal plans"] },
  { id: 11, niche: "Weight Loss", name: "No-Gym Fat Loss", angle: "Myth-buster guide", description: "Debunks gym myths and recommends an at-home program plus appetite support.", recommendedProducts: ["At-home programs", "Appetite control"] },
  { id: 12, niche: "Weight Loss", name: "30-Day Reset", angle: "Challenge framework", description: "A structured month-long reset that positions a product as the daily anchor.", recommendedProducts: ["Detox / reset kits", "Nutrition guides"] },

  // Self-Improvement
  { id: 13, niche: "Self-Improvement", name: "Beat Procrastination", angle: "Actionable system", description: "A focus framework that recommends a productivity course/app as the engine.", recommendedProducts: ["Productivity courses", "Focus apps"] },
  { id: 14, niche: "Self-Improvement", name: "Morning Routine Blueprint", angle: "Aspirational guide", description: "Builds the ideal morning and recommends journals, habit tools, and a mindset course.", recommendedProducts: ["Habit trackers", "Mindset courses"] },
  { id: 15, niche: "Self-Improvement", name: "Confidence in 30 Days", angle: "Transformation story", description: "Personal-growth angle that funnels toward a confidence/communication program.", recommendedProducts: ["Communication courses", "Coaching programs"] },
];
