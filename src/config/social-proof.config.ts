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
      "Data stream active — scanning retail networks",
      "Member Associate routed $127 in unclaimed commissions",
      "Encrypted node synchronized — extraction ready",
      "Initiate verified — private server connected",
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
  systemStatus: {
    initialDelayMs: 5000,
    visibleMs: 4500,
    intervalMinMs: 10000,
    intervalMaxMs: 18000,
  },
} as const;
