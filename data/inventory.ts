import type { InteractionInventory } from '../types/twin3';

export const INTERACTION_INVENTORY: InteractionInventory = [
  {
    id: 'welcome',
    triggers: ['start', 'hi', 'hello', 'menu'],
    response: {
      text: "Own Your Humanity with twin3\n\nTransform your human warmth into a 256D Twin Matrix. Let your Personal Agent work and earn for you while you focus on living.",
      delay: 800,
      card: {
        type: 'feature_grid',
        features: [
          {
            icon: 'verification',
            title: 'Universal Human Passport',
            description: 'Verify once and gain seamless access to any platform requiring human proof. No more repetitive captchas—just your digital key to a bot-free internet.'
          },
          {
            icon: 'matrix',
            title: 'Your 256D Digital Twin',
            description: 'Construct your evolving identity by lighting up the 16×16 Twin Matrix. Across physical, mental, social, and digital dimensions—ensure you stay you in the digital world.'
          },
          {
            icon: 'agent',
            title: '24/7 Personal Agent',
            description: 'Empower an agent that carries your preferences to work, earn, and filter noise. Your twin manages the digital clutter while you reclaim your time to live.'
          }
        ]
      }
    },
    suggestedActions: [
      { label: 'Mint Free SBT', payload: 'verify_human' },
      { label: 'What is SBT?', payload: 'sbt_info' },
      { label: 'Why Verify Humanity?', payload: 'why_verify' }
    ]
  },
  {
    id: 'how_it_works',
    triggers: ['how', 'how it works', 'explain', 'what is'],
    response: {
      text: "**How twin3 Works**\n\n**1. Connect** — Link your social accounts to verify your identity\n\n**2. Analyze** — AI generates your Twin Matrix Score (0-255) based on your content and engagement\n\n**3. Match** — Get matched with brand tasks tailored to your style and influence level\n\n**4. Earn** — Complete tasks to earn tokens and build your digital reputation\n\nReady to discover your value?",
      delay: 600
    },
    suggestedActions: [
      { label: 'Mint Free SBT', payload: 'verify_human' },
      { label: 'What is SBT?', payload: 'sbt_info' }
    ]
  },
  {
    id: 'verify_human',
    triggers: ['verify', 'verification', 'prove', 'human', 'mint'],
    response: {
      text: "**Verify Humanity**\n\nSelect a verification method to prove you are human and unlock the Twin Matrix. The Humanity Index measures the likelihood that you are a real person and is the fundamental building block of trust in the decentralised community.\n\n✅ **Social Account Verification** — Connect your Instagram or Twitter\n✅ **Biometric Verification** — Use face or voice recognition\n✅ **Community Vouching** — Get verified by existing members",
      delay: 500
    },
    suggestedActions: [
      { label: 'What is SBT?', payload: 'sbt_info' },
      { label: 'Why Verify Humanity?', payload: 'why_verify' }
    ]
  },
  {
    id: 'twin_matrix',
    triggers: ['matrix', 'twin matrix', '256d', 'profile'],
    response: {
      text: "Here's your **Twin Matrix** — a 256-dimensional representation of your authentic self across 6 core dimensions.\n\n🔴 **Physical** — Body metrics & health data\n🟡 **Social** — Community engagement & relationships\n🔵 **Digital** — Online presence & content creation\n🟢 **Spiritual** — Values, beliefs & inner alignment\n\nThis forms the foundation of your soulbound identity in the AI era.",
      delay: 600
    },
    suggestedActions: [
      { label: 'Mint Free SBT', payload: 'verify_human' },
      { label: 'Browse Tasks', payload: 'browse_tasks' }
    ]
  },
  {
    id: 'browse_tasks',
    triggers: ['task', 'browse', 'jobs', 'earn'],
    response: {
      text: "**📍 Recommended for You**\n\nComplete **Proof of Humanity** first to boost your score and unlock premium tasks!\n\nHere are the current brand task opportunities:",
      delay: 500,
      card: {
        type: 'task_opportunity',
        taskPayload: {
          brand: { name: "L'Oréal Paris", logoUrl: '' },
          title: 'Lipstick Filter Challenge',
          description: 'Create 15-60s Reels using specific filter showcasing #666 shade.',
          reward: { tokens: '500 $twin3', gift: 'Full PR Package (Worth $3000)' },
          status: 'open',
          spotsLeft: 3
        }
      }
    },
    suggestedActions: [
      { label: 'View Twin Matrix', payload: 'twin_matrix' },
      { label: 'Mint Free SBT', payload: 'verify_human' }
    ]
  },
  {
    id: 'sbt_info',
    triggers: ['sbt', 'soulbound', 'what is sbt'],
    response: {
      text: "**What is an SBT?**\n\n**Soulbound Token (SBT)** is a permanent, non-transferable digital identity token on the blockchain.\n\nUnlike normal NFTs, it cannot be bought, sold, or transferred. It serves as your on-chain reputation proof, certifying that 'You are a unique human' without revealing sensitive personal data.",
      delay: 500
    },
    suggestedActions: [
      { label: 'Why Verify Humanity?', payload: 'why_verify' },
      { label: 'Mint Free SBT', payload: 'verify_human' }
    ]
  },
  {
    id: 'why_verify',
    triggers: ['why', 'benefit', 'reason', 'why verify'],
    response: {
      text: "**Why Verify Humanity?**\n\nVerification protects the twin3 ecosystem from bots and ensures fair rewards for real humans.\n\n**Benefits:**\n• **Unlock Earning**: Access premium tasks.\n• **Boost Trust**: Higher trust score = more opportunities.\n• **Governance**: Future voting rights in the DAO.",
      delay: 500
    },
    suggestedActions: [
      { label: 'What is SBT?', payload: 'sbt_info' },
      { label: 'Mint Free SBT', payload: 'verify_human' }
    ]
  },
  {
    id: 'roadmap_info',
    triggers: ['roadmap', 'milestone', 'timeline', 'future', 'plans'],
    response: {
      text: "**Twin3 Roadmap (2026-2027)**\n\n• **Q1 2026 (Foundation)**: V2.0 Core Build, Web2 Bridge\n• **Q2 2026 (Ignition)**: Public Beta, Human Agent MVP, Airdrop #1\n• **Q3 2026 (PMF)**: Agentic Marketplace Beta, Airdrop #2\n• **Q4 2026 (Hypergrowth)**: Public API, DAO Governance\n\nCurrent Phase: **Foundation** (User Target: 10,000)",
      delay: 500
    },
    suggestedActions: [
      { label: 'What is SBT?', payload: 'sbt_info' },
      { label: 'Mint Free SBT', payload: 'verify_human' }
    ]
  },
  {
    id: 'tokenomics_info',
    triggers: ['token', 'allocation', 'economics', 'supply', 'airdrop'],
    response: {
      text: "**Token Allocation ($TWIN)**\n\n• **Community Incentive**: 30% (300M) - Task rewards & growth\n• **Core Team**: 25% (250M) - Long-term commitment\n• **Ecosystem Growth**: 15% (150M) - Partnerships & integrations\n• **Liquidity**: 8% (80M) - Market stability\n• **Airdrop**: 6% (60M) - Early supporters (Q2 & Q3 2026)\n\n**Total Supply**: 1,000,000,000",
      delay: 500
    },
    suggestedActions: [
      { label: 'What is SBT?', payload: 'sbt_info' },
      { label: 'Mint Free SBT', payload: 'verify_human' }
    ]
  },
  {
    id: 'white_paper',
    triggers: ['white paper', 'whitepaper', 'paper'],
    response: {
      text: "**Twin3 White Paper**\n\nThe Twin3 White Paper outlines our vision for a human-centric digital identity protocol built on the 256D Twin Matrix.\n\n📄 Key Topics:\n• Soulbound Token Architecture\n• 256D Twin Matrix Specification\n• Agentic Marketplace Design\n• Token Economics & Governance\n\nThe full white paper is coming soon. Stay tuned!",
      delay: 500
    },
    suggestedActions: [
      { label: 'View Roadmap', payload: 'roadmap_info' },
      { label: 'Token Allocation', payload: 'tokenomics_info' }
    ]
  },
  {
    id: 'fallback',
    triggers: [],
    response: {
      text: "I'm not sure I understand that. Let me help you explore twin3!\n\nPlease try the options below:",
      delay: 300
    },
    suggestedActions: [
      { label: 'Mint Free SBT', payload: 'verify_human' },
      { label: 'What is the Roadmap?', payload: 'roadmap_info' },
      { label: 'Token Allocation?', payload: 'tokenomics_info' }
    ]
  }
];
