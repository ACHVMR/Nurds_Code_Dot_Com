/**
 * V0 Chat SDK + ChainGPT UI Configuration
 * Integrates Vercel's v0 Chat SDK with ChainGPT UI for Web3 version
 */

export const V0_CHAT_CONFIG = {
  // V0 Chat SDK Settings
  sdk: {
    apiKey: import.meta.env.VITE_V0_API_KEY,
    baseUrl: 'https://api.v0.dev',
    version: 'v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Chat Features
  chat: {
    maxMessages: 100,
    maxContextLength: 4096,
    enableStreaming: true,
    enableImageGeneration: true,
    enableCodeExecution: false, // Safety first for web3
    enableWebSearch: false, // Isolated environment
    messageRetention: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },

  // Model Configuration
  models: {
    default: 'gpt-4-vision',
    fallback: 'gpt-3.5-turbo',
    available: [
      { id: 'gpt-4-vision', name: 'GPT-4 Vision', tier: 'premium' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', tier: 'premium' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', tier: 'standard' },
    ],
    web3Models: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', tier: 'web3' },
      { id: 'llama-70b', name: 'Llama 70B', tier: 'web3' },
    ],
  },

  // ChainGPT UI Theme
  ui: {
    theme: {
      primary: '#39FF14', // NURD Green
      secondary: '#D946EF', // Purple accent
      dark: '#0F0F0F', // Almost black
      light: '#FFFFFF',
      surface: '#1A1A1A',
      border: '#333333',
      error: '#FF4444',
      success: '#44FF44',
      warning: '#FFAA44',
    },

    // UI Components
    components: {
      enableChatBubbles: true,
      enableMarkdown: true,
      enableCodeHighlighting: true,
      enableImagePreview: true,
      enableFileUpload: true,
      enableVoiceInput: true,
      enableVoiceOutput: true,
      enableTypingIndicator: true,
      enableTimestamps: false, // Privacy focused
      enableUserAvatar: true,
      enableAssistantAvatar: true,
    },

    // Layout
    layout: {
      position: 'right', // 'left' | 'right' | 'center' | 'full'
      width: '400px',
      height: '600px',
      borderRadius: '12px',
      zIndex: 9999,
      enableMinimize: true,
      enableFullscreen: true,
      enableDragAndDrop: true,
      animationDuration: 300, // ms
    },

    // Typography
    typography: {
      fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },

    // Animation
    animations: {
      messageEntry: 'slideUp',
      messageBubbleHover: 'glow',
      buttonHover: 'pulse',
      loadingIndicator: 'spin',
      transitionDuration: 0.3,
    },
  },

  // Web3 Integration
  web3: {
    enableWalletConnect: true,
    enableMetaMask: true,
    enableWalletChat: true,
    blockchainNetworks: ['ethereum', 'polygon', 'arbitrum', 'optimism'],
    contractInteraction: true,
    transactionSigning: true,
    gasEstimation: true,
    tokenSwap: false, // Via API only
  },

  // Security & Privacy
  security: {
    enableEncryption: true,
    encryptionMethod: 'AES-256',
    enableDataObfuscation: true,
    enablePrivateMode: true,
    enableAnonymousChat: false,
    enableUserTracking: false,
    enableAnalytics: true,
    analyticsProvider: 'posthog', // Privacy-focused
    consentRequired: true,
    dataRetention: 30, // days
  },

  // API Rate Limiting
  rateLimiting: {
    messagesPerMinute: 30,
    requestsPerHour: 500,
    concurrentChats: 3,
    enableAdaptiveRateLimit: true,
  },

  // Logging & Debugging
  logging: {
    enableConsoleLogging: import.meta.env.MODE === 'development',
    enableRemoteLogging: false,
    logLevel: import.meta.env.MODE === 'development' ? 'debug' : 'error',
    enableErrorTracking: true,
    errorTrackingProvider: 'sentry',
  },

  // Feature Flags
  features: {
    enableBetaFeatures: false,
    enableExperimentalModels: false,
    enableImageGeneration: true,
    enableCodeInterpretation: false,
    enableWebSearch: false,
    enablePlugins: true,
    enableCustomPrompts: true,
    enableConversationPresets: true,
  },

  // Fallback Configuration
  fallback: {
    enableOfflineMode: false,
    enableCaching: true,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    enableLocalStorage: true,
    maxLocalMessages: 50,
  },
};

export const CHAINGPT_UI_CONFIG = {
  // UI Structure
  layout: {
    headerHeight: '60px',
    sidebarWidth: '280px',
    enableSidebar: true,
    enableHeader: true,
    enableFooter: false,
    compactMode: false,
    responsiveBreakpoints: {
      mobile: 480,
      tablet: 768,
      desktop: 1024,
    },
  },

  // Chat Interface
  chatInterface: {
    messageAlignment: 'flex-col',
    bubbleStyle: 'rounded', // 'rounded' | 'square' | 'minimal'
    bubbleAnimation: true,
    enableReactions: true,
    enableCitationLinks: true,
    enableCodeCopy: true,
    enableMessageEdit: false, // Immutable for audit trail
    enableMessageDelete: true,
    enableMessagePin: true,
    enableConversationSharing: true,
    shareFormat: 'markdown', // 'markdown' | 'html' | 'json'
  },

  // Input Configuration
  input: {
    type: 'textarea', // 'textarea' | 'input'
    placeholder: 'Ask about smart contracts, NFTs, or DeFi...',
    maxLength: 2000,
    enableMentions: true,
    enableCommands: true,
    enableEmojis: true,
    enableAttachments: true,
    enableVoice: true,
    voiceLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
    enableImagePaste: true,
    autoExpand: true,
    minHeight: '44px',
    maxHeight: '200px',
  },

  // Sidebar Components
  sidebar: {
    sections: [
      {
        id: 'history',
        title: 'Chat History',
        collapsible: true,
        defaultOpen: true,
        maxItems: 20,
        searchable: true,
      },
      {
        id: 'bookmarks',
        title: 'Bookmarks',
        collapsible: true,
        defaultOpen: true,
        maxItems: 50,
      },
      {
        id: 'templates',
        title: 'Prompts',
        collapsible: true,
        defaultOpen: false,
        maxItems: 30,
      },
      {
        id: 'web3',
        title: 'Web3 Tools',
        collapsible: true,
        defaultOpen: true,
        tools: ['wallet', 'transactions', 'contracts', 'tokens'],
      },
      {
        id: 'settings',
        title: 'Settings',
        collapsible: true,
        defaultOpen: false,
      },
    ],
  },

  // Header Configuration
  header: {
    title: 'ACHEEVY AI Agent',
    subtitle: 'Web3-Enabled Chat Interface',
    enableLogo: true,
    enableBreadcrumbs: false,
    enableSearch: true,
    searchPlaceholder: 'Search conversations...',
    enableNotifications: true,
    enableUserMenu: true,
    enableHelpButton: true,
    enableSettingsButton: true,
  },

  // Status Indicators
  status: {
    enableOnlineStatus: true,
    enableTypingStatus: true,
    enableReadReceipts: false,
    enableConnectionStatus: true,
    enableSyncStatus: true,
    enableTokenCountDisplay: false, // Privacy
  },

  // Contextual Actions
  actions: {
    enableCopy: true,
    enableDownload: true,
    enablePrint: true,
    enableShare: true,
    enableFork: true,
    enableRegenerate: true,
    enableRateMessage: true,
    enableFeedback: true,
    enableReportIssue: true,
  },

  // Web3-Specific Components
  web3Components: {
    enableWalletDisplay: true,
    enableTokenBalance: true,
    enableNetworkIndicator: true,
    enableGasEstimate: true,
    enableTransactionPreview: true,
    enableContractInteraction: true,
    enableDeFiTools: true,
  },

  // Dark Mode / Theme
  theme: {
    mode: 'dark', // 'light' | 'dark' | 'auto'
    accentColor: '#39FF14',
    backgroundColor: '#0F0F0F',
    surfaceColor: '#1A1A1A',
    textColor: '#FFFFFF',
    borderColor: '#333333',
    shadowIntensity: 0.5,
    glowEffect: true,
    glowColor: '#39FF14',
  },

  // Accessibility
  accessibility: {
    enableKeyboardShortcuts: true,
    enableScreenReaderSupport: true,
    enableHighContrast: false,
    enableLargeText: true,
    enableReducedMotion: true,
    enableFocusIndicators: true,
    enableAriaLabels: true,
    focusIndicatorColor: '#39FF14',
  },
};

export const WEB3_AGENT_CONFIG = {
  // Agent Identity
  agent: {
    name: 'ACHEEVY',
    description: 'Web3-enabled AI agent for smart contract interaction',
    avatar: '/assets/characters/acheevy.svg',
    version: '1.0.0',
    tier: 'enterprise',
  },

  // Capabilities
  capabilities: {
    smartContractAnalysis: true,
    transactionSimulation: true,
    gasOptimization: true,
    securityAudit: true,
    defiAnalysis: true,
    nftAnalysis: true,
    daoGovernance: true,
    bridgeAnalysis: true,
  },

  // Blockchain Networks
  networks: {
    ethereum: {
      enabled: true,
      rpcUrl: import.meta.env.VITE_ETH_RPC_URL,
      chainId: 1,
      explorerUrl: 'https://etherscan.io',
    },
    polygon: {
      enabled: true,
      rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL,
      chainId: 137,
      explorerUrl: 'https://polygonscan.com',
    },
    arbitrum: {
      enabled: true,
      rpcUrl: import.meta.env.VITE_ARB_RPC_URL,
      chainId: 42161,
      explorerUrl: 'https://arbiscan.io',
    },
    optimism: {
      enabled: true,
      rpcUrl: import.meta.env.VITE_OP_RPC_URL,
      chainId: 10,
      explorerUrl: 'https://optimistic.etherscan.io',
    },
  },

  // Agent Behavior
  behavior: {
    responseTimeout: 30000, // ms
    maxContextWindow: 8192, // tokens
    enableStreamingResponses: true,
    enableFunctionCalling: true,
    enableToolUse: true,
    enableMemory: true,
    memoryLength: 20, // messages
    enableLearning: false, // Immutable for security
  },

  // System Prompts
  systemPrompts: {
    default: `You are ACHEEVY, a Web3-enabled AI agent specialized in blockchain analysis, smart contracts, and DeFi. 
    You provide accurate, security-focused guidance on cryptocurrency, NFTs, and smart contract interactions.
    Always prioritize user security and never recommend risky actions without clear warnings.
    Format responses with clear explanations and relevant code examples when applicable.`,
    
    smartContract: `Analyze smart contracts for security vulnerabilities, gas optimization, and best practices.
    Provide detailed explanations of contract logic and potential risks.`,
    
    defi: `Guide users through DeFi protocols, yield farming, liquidity pools, and risk management.
    Always emphasize the importance of audited contracts and proper due diligence.`,
    
    nft: `Help users understand NFT standards, minting, trading, and valuation considerations.
    Discuss gas efficiency, rarity scoring, and market trends.`,
  },

  // Tool Integration
  tools: {
    enableBlockchainQuery: true,
    enableContractDeployer: false, // For safety
    enableTransactionBuilder: true,
    enableGasEstimator: true,
    enableAuditChecker: true,
    enablePriceAggregator: true,
    enableLiquidityAnalyzer: true,
    enableSlippageCalculator: true,
  },

  // Safety Features
  safety: {
    enableWarnings: true,
    enableSlippageProtection: true,
    enablePriceImpactDetection: true,
    enableRugPullDetection: true,
    enableScamDetection: true,
    enableFlashLoanDetection: true,
    enableBlacklist: true,
    blacklistedAddresses: [],
    requireConfirmation: true,
    confirmationTimeout: 60000, // ms
  },

  // Monitoring & Analytics
  monitoring: {
    enableMetrics: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableUsageAnalytics: true,
    enableSecurityAudit: true,
    enableUptime: true,
  },
};

export default {
  V0_CHAT_CONFIG,
  CHAINGPT_UI_CONFIG,
  WEB3_AGENT_CONFIG,
};
