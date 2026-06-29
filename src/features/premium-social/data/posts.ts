export interface SocialPost {
  id: string;
  niche: string;
  post: string;
  earningsMin: number;
  earningsMax: number;
}

export const SOCIAL_NICHES = [
  "All",
  "Weight Loss",
  "Make Money Online",
  "Health & Fitness",
  "Beauty & Skincare",
  "Relationships",
  "Tech & Gadgets",
  "Pets",
  "Home & Garden",
] as const;

/** Pre-written Facebook posts. [LINK] is replaced with the member's affiliate link. */
export const SOCIAL_POSTS: SocialPost[] = [
  // Weight Loss
  { id: "wl-1", niche: "Weight Loss", post: "🔥 I lost 23 pounds in 6 weeks without starving myself! No crazy diets, no hours at the gym. Just a simple system that actually works. If you're struggling with weight loss, check this out: [LINK]", earningsMin: 75, earningsMax: 200 },
  { id: "wl-2", niche: "Weight Loss", post: "I finally found something that works! Down 18 pounds and I feel AMAZING. No more yo-yo dieting for me. If you want to know my secret: [LINK]", earningsMin: 60, earningsMax: 180 },
  { id: "wl-3", niche: "Weight Loss", post: "Who else is tired of diets that don't work? 🙋‍♀️ I was too until I found this. Lost 15 pounds in my first month! [LINK]", earningsMin: 50, earningsMax: 150 },
  { id: "wl-4", niche: "Weight Loss", post: "My clothes are fitting better, I have more energy, and I'm down 20 pounds! This is the easiest weight loss method I've ever tried. See for yourself: [LINK]", earningsMin: 70, earningsMax: 190 },
  { id: "wl-5", niche: "Weight Loss", post: "No more counting calories. No more feeling hungry all the time. Just real results. I've lost 25 pounds and I'm never going back! [LINK]", earningsMin: 80, earningsMax: 210 },
  { id: "wl-6", niche: "Weight Loss", post: "My doctor is amazed at my progress! Lost 30 pounds and my blood pressure is back to normal. This changed my life: [LINK]", earningsMin: 90, earningsMax: 250 },
  { id: "wl-7", niche: "Weight Loss", post: "I wish I'd found this sooner! 3 months in and I'm down 35 pounds. My confidence is through the roof! Check it out: [LINK]", earningsMin: 85, earningsMax: 230 },
  { id: "wl-8", niche: "Weight Loss", post: "I was skeptical at first, but WOW! Down 22 pounds in 8 weeks. No gimmicks, just results. See what worked for me: [LINK]", earningsMin: 75, earningsMax: 195 },

  // Make Money Online
  { id: "mmo-1", niche: "Make Money Online", post: "💰 I made $1,847 last week from my laptop! No boss, no commute, just freedom. If you're ready to change your life: [LINK]", earningsMin: 100, earningsMax: 300 },
  { id: "mmo-2", niche: "Make Money Online", post: "Who else is tired of living paycheck to paycheck? 🙋 I was too until I found this. Now I'm making $500+ per day from home! [LINK]", earningsMin: 120, earningsMax: 350 },
  { id: "mmo-3", niche: "Make Money Online", post: "I quit my 9-5 job 3 months ago and I've never been happier! Making more money working from home than I ever did at my old job. Here's how: [LINK]", earningsMin: 150, earningsMax: 400 },
  { id: "mmo-4", niche: "Make Money Online", post: "This is NOT a scam. I was skeptical too, but I've made over $10,000 in the last 2 months. Real money, real results: [LINK]", earningsMin: 130, earningsMax: 380 },
  { id: "mmo-5", niche: "Make Money Online", post: "My first $1,000 day! 🎉 I never thought this was possible, but here I am. If I can do it, you can too: [LINK]", earningsMin: 110, earningsMax: 320 },
  { id: "mmo-6", niche: "Make Money Online", post: "Working in my pajamas and making more money than ever. This is the life! Want to know my secret? [LINK]", earningsMin: 95, earningsMax: 280 },
  { id: "mmo-7", niche: "Make Money Online", post: "I used to think 'make money online' was a joke. Then I tried this and made $3,200 in my first month. No joke: [LINK]", earningsMin: 140, earningsMax: 390 },
  { id: "mmo-8", niche: "Make Money Online", post: "No experience needed. No special skills required. Just follow the steps and make money. I'm living proof: [LINK]", earningsMin: 105, earningsMax: 310 },

  // Health & Fitness
  { id: "hf-1", niche: "Health & Fitness", post: "My energy levels are through the roof! 🚀 I feel 10 years younger. If you're tired of feeling tired, you need this: [LINK]", earningsMin: 60, earningsMax: 170 },
  { id: "hf-2", niche: "Health & Fitness", post: "No more afternoon crashes! I have steady energy all day long now. This made all the difference: [LINK]", earningsMin: 55, earningsMax: 160 },
  { id: "hf-3", niche: "Health & Fitness", post: "I'm sleeping better, feeling stronger, and loving life! This simple change transformed my health: [LINK]", earningsMin: 65, earningsMax: 180 },
  { id: "hf-4", niche: "Health & Fitness", post: "My doctor said my blood work looks amazing! Best it's been in years. Here's what I've been doing: [LINK]", earningsMin: 70, earningsMax: 190 },
  { id: "hf-5", niche: "Health & Fitness", post: "I used to get sick all the time. Now my immune system is stronger than ever! This is my secret weapon: [LINK]", earningsMin: 60, earningsMax: 175 },
  { id: "hf-6", niche: "Health & Fitness", post: "Home workouts that actually work! No gym membership needed. Lost fat, gained muscle: [LINK]", earningsMin: 55, earningsMax: 165 },

  // Beauty & Skincare
  { id: "bs-1", niche: "Beauty & Skincare", post: "My skin has NEVER looked this good! ✨ People keep asking what I'm using. Here's my secret: [LINK]", earningsMin: 50, earningsMax: 150 },
  { id: "bs-2", niche: "Beauty & Skincare", post: "I look 5 years younger! No expensive treatments, just this one simple thing: [LINK]", earningsMin: 55, earningsMax: 160 },
  { id: "bs-3", niche: "Beauty & Skincare", post: "My wrinkles are fading and my skin is glowing! I can't believe the difference. Check this out: [LINK]", earningsMin: 60, earningsMax: 170 },
  { id: "bs-4", niche: "Beauty & Skincare", post: "Finally found something that actually works for my skin! No more breakouts, just clear, beautiful skin: [LINK]", earningsMin: 50, earningsMax: 155 },
  { id: "bs-5", niche: "Beauty & Skincare", post: "My friends keep asking if I got Botox! 😂 Nope, just using this amazing product: [LINK]", earningsMin: 65, earningsMax: 180 },
  { id: "bs-6", niche: "Beauty & Skincare", post: "This anti-aging routine takes 2 minutes and the results are incredible: [LINK]", earningsMin: 55, earningsMax: 165 },

  // Relationships
  { id: "rel-1", niche: "Relationships", post: "My marriage has never been better! ❤️ This saved our relationship. If you're struggling: [LINK]", earningsMin: 70, earningsMax: 200 },
  { id: "rel-2", niche: "Relationships", post: "We were on the verge of divorce. Now we're happier than ever! This made all the difference: [LINK]", earningsMin: 80, earningsMax: 220 },
  { id: "rel-3", niche: "Relationships", post: "Finally found the love of my life! 💕 This helped me attract the right person: [LINK]", earningsMin: 60, earningsMax: 180 },
  { id: "rel-4", niche: "Relationships", post: "Communication is so much easier now! We actually understand each other: [LINK]", earningsMin: 65, earningsMax: 185 },
  { id: "rel-5", niche: "Relationships", post: "The spark is back! 🔥 After 15 years of marriage, we feel like newlyweds again: [LINK]", earningsMin: 75, earningsMax: 210 },

  // Tech & Gadgets
  { id: "tech-1", niche: "Tech & Gadgets", post: "This gadget changed my life! 📱 Saves me 2+ hours every day. Best purchase I've made: [LINK]", earningsMin: 45, earningsMax: 140 },
  { id: "tech-2", niche: "Tech & Gadgets", post: "I can't believe I lived without this! Makes everything so much easier: [LINK]", earningsMin: 50, earningsMax: 145 },
  { id: "tech-3", niche: "Tech & Gadgets", post: "My productivity has doubled since I got this! 🚀 If you work from home, you NEED this: [LINK]", earningsMin: 55, earningsMax: 155 },
  { id: "tech-4", niche: "Tech & Gadgets", post: "This is the coolest thing I've ever owned! Everyone who sees it wants one: [LINK]", earningsMin: 50, earningsMax: 150 },
  { id: "tech-5", niche: "Tech & Gadgets", post: "Best tech purchase of the year! Works exactly as advertised and then some: [LINK]", earningsMin: 60, earningsMax: 165 },

  // Pets
  { id: "pet-1", niche: "Pets", post: "My dog is so much happier now! 🐕 This made training SO easy. Every dog owner needs this: [LINK]", earningsMin: 40, earningsMax: 130 },
  { id: "pet-2", niche: "Pets", post: "No more barking at night! My neighbors are thanking me. Game-changer for dog owners: [LINK]", earningsMin: 45, earningsMax: 135 },
  { id: "pet-3", niche: "Pets", post: "My cat's coat has never looked better! ✨ Shiny, soft, and healthy: [LINK]", earningsMin: 35, earningsMax: 120 },
  { id: "pet-4", niche: "Pets", post: "Finally found something that works for my dog's anxiety! He's so much calmer now: [LINK]", earningsMin: 50, earningsMax: 145 },
  { id: "pet-5", niche: "Pets", post: "My vet recommended this and it's been amazing! My pet is healthier and happier: [LINK]", earningsMin: 55, earningsMax: 155 },

  // Home & Garden
  { id: "hg-1", niche: "Home & Garden", post: "My garden has never looked better! 🌱 This made gardening so much easier: [LINK]", earningsMin: 40, earningsMax: 130 },
  { id: "hg-2", niche: "Home & Garden", post: "My house is finally organized! This storage solution is genius: [LINK]", earningsMin: 45, earningsMax: 135 },
  { id: "hg-3", niche: "Home & Garden", post: "Cleaning is SO much faster now! This tool is a game-changer: [LINK]", earningsMin: 50, earningsMax: 145 },
  { id: "hg-4", niche: "Home & Garden", post: "My lawn looks like a golf course! ⛳ Neighbors keep asking my secret: [LINK]", earningsMin: 55, earningsMax: 155 },
  { id: "hg-5", niche: "Home & Garden", post: "Best home improvement purchase ever! Increased my property value: [LINK]", earningsMin: 60, earningsMax: 165 },
  { id: "hg-6", niche: "Home & Garden", post: "This kitchen gadget saved me SO much time! Cooking is fun again: [LINK]", earningsMin: 45, earningsMax: 140 },
  { id: "hg-7", niche: "Home & Garden", post: "The easiest way to keep your house spotless. I was blown away: [LINK]", earningsMin: 50, earningsMax: 150 },
];
