export const socialProof = {
  enabled: true,
  networkCapacity: { current: 24, max: 25 },
  loginPage: {
    activeMembers: 24,
    earnedThisMonth: "",
    rating: "",
  },
  ticker: {
    onlineCount: 24,
    messages: [
      "Members are building websites right now",
      "New product links added across the network",
      "Support team online for members",
      "Another website just went live",
    ],
  },
  toast: {
    messages: [
      { name: "Sarah M.", action: "just earned", amount: "$412" },
      { name: "James L.", action: "just earned", amount: "$189" },
      { name: "Kevin P.", action: "just earned", amount: "$527" },
      { name: "Diana W.", action: "just earned", amount: "$301" },
    ],
    intervalMinMs: 15000,
    intervalMaxMs: 25000,
  },
} as const;
