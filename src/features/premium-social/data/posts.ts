export interface SocialPost {
  id: number;
  niche: string;
  text: string;
}

export const SOCIAL_NICHES = [
  "Weight Loss",
  "Make Money Online",
  "Health & Fitness",
  "Relationships",
  "Self-Improvement",
] as const;

/** Personal-story style posts. {LINK} is replaced with the Initiate's affiliate link. */
export const SOCIAL_POSTS: SocialPost[] = [
  // Weight Loss
  { id: 1, niche: "Weight Loss", text: "I stopped chasing crash diets and finally found something that fit my real life. Down noticeably in a few weeks without starving myself. This is what actually moved the needle for me 👇 {LINK}" },
  { id: 2, niche: "Weight Loss", text: "Honestly didn't think anything would work after years of trying. The difference was having a simple daily routine I could stick to. If you're stuck on a plateau, start here: {LINK}" },
  { id: 3, niche: "Weight Loss", text: "The hardest part was the constant cravings. Once I got those under control everything else got easier. Sharing what helped me in case it helps someone here too: {LINK}" },
  { id: 4, niche: "Weight Loss", text: "No gym, no crazy meal prep — just one small change I made every morning. Three months later I barely recognize the before photos. Here's exactly what I used: {LINK}" },
  { id: 5, niche: "Weight Loss", text: "People keep asking what I changed, so I'll just leave this here. It's the simple system I wish I'd found years ago: {LINK}" },
  { id: 6, niche: "Weight Loss", text: "Slow and steady actually won for me this time. No quick-fix nonsense, just a routine that's easy to keep. If you want the same starting point: {LINK}" },

  // Make Money Online
  { id: 7, niche: "Make Money Online", text: "Spent months overthinking it before I just started. The thing that finally clicked for me was keeping it simple and consistent. This is the exact approach I followed: {LINK}" },
  { id: 8, niche: "Make Money Online", text: "Skeptical doesn't even cover how I felt at first. But the step-by-step part is what made it doable for a total beginner. If you're curious, start here: {LINK}" },
  { id: 9, niche: "Make Money Online", text: "I'm not techy at all and I still figured this out. The walkthrough does most of the heavy lifting. Sharing it for anyone who keeps getting stuck: {LINK}" },
  { id: 10, niche: "Make Money Online", text: "The best part is it doesn't need a big upfront budget or an audience. Just time and following the steps. Here's what I used to get going: {LINK}" },
  { id: 11, niche: "Make Money Online", text: "Wish someone had handed me this when I started instead of 50 random YouTube videos. It's all in one place here: {LINK}" },
  { id: 12, niche: "Make Money Online", text: "Quietly working on this on the side for a while now and it's finally clicking. If you want the same blueprint I'm using: {LINK}" },

  // Health & Fitness
  { id: 13, niche: "Health & Fitness", text: "My energy used to crash every afternoon. Fixed my routine around a couple of simple things and the difference is night and day. Here's what worked for me: {LINK}" },
  { id: 14, niche: "Health & Fitness", text: "You don't need a fancy gym membership to feel strong again. I do most of this at home. Sharing the routine that got me consistent: {LINK}" },
  { id: 15, niche: "Health & Fitness", text: "Recovery was my missing piece. Once I sorted sleep and the basics, everything improved. This is what I lean on: {LINK}" },
  { id: 16, niche: "Health & Fitness", text: "Started small — 10 minutes a day — and it snowballed from there. If you want an easy on-ramp, this is where I'd start: {LINK}" },
  { id: 17, niche: "Health & Fitness", text: "Feeling 10 years younger isn't a cliché, it's just consistency plus the right basics. Here's the setup I follow: {LINK}" },
  { id: 18, niche: "Health & Fitness", text: "I kept blaming my age. Turns out it was my habits. Changed a few and bounced right back. This helped me most: {LINK}" },

  // Relationships
  { id: 19, niche: "Relationships", text: "Communication was our biggest issue until we changed one simple thing. Wish we'd learned it sooner. Sharing what helped us: {LINK}" },
  { id: 20, niche: "Relationships", text: "Confidence in dating isn't about being someone you're not — it's a few small shifts. This is what finally clicked for me: {LINK}" },
  { id: 21, niche: "Relationships", text: "Reconnecting after a rough patch felt impossible until we tried this approach. Honestly a game changer for us: {LINK}" },
  { id: 22, niche: "Relationships", text: "I used to freeze up in conversations. A simple framework changed that completely. If you struggle with the same thing: {LINK}" },
  { id: 23, niche: "Relationships", text: "Small daily habits did more for our relationship than any big gesture. Here's the simple thing we started doing: {LINK}" },
  { id: 24, niche: "Relationships", text: "If you feel like you're always the one trying, this shifted everything for me. Sharing in case it helps someone: {LINK}" },

  // Self-Improvement
  { id: 25, niche: "Self-Improvement", text: "Procrastination ruled my days until I found a system that actually fit how my brain works. This is what broke the cycle: {LINK}" },
  { id: 26, niche: "Self-Improvement", text: "Built a morning routine I actually stick to and the rest of my day finally fell into place. Here's the blueprint I followed: {LINK}" },
  { id: 27, niche: "Self-Improvement", text: "Focus felt impossible with my phone always buzzing. One simple shift fixed it. Sharing what worked for me: {LINK}" },
  { id: 28, niche: "Self-Improvement", text: "Confidence really is a skill you can build. 30 days of small steps changed how I show up. This is where I started: {LINK}" },
  { id: 29, niche: "Self-Improvement", text: "I stopped trying to overhaul everything at once and just changed one habit. Momentum did the rest. Here's the approach: {LINK}" },
  { id: 30, niche: "Self-Improvement", text: "The mindset stuff sounds fluffy until it works. This is the practical version that actually stuck for me: {LINK}" },
];
