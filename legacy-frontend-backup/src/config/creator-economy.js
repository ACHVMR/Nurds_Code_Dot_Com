/**
 * Creator Economy Configuration
 * Defines pricing, tiers, and marketplace settings
 */

// Creator subscription tiers
export const CREATOR_TIERS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    maxPlugs: 1,
    platformFee: 0.20, // 20%
    features: [
      'Publish 1 Plug',
      'NurdsCode branding on app',
      'Basic analytics',
      'Community support',
      'Standard deployment'
    ],
    branding: 'nurdscode_watermark',
    supportLevel: 'community',
    analytics: 'basic'
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 19,
    priceId: 'price_creator_monthly', // Stripe price ID
    maxPlugs: 10,
    platformFee: 0.15, // 15%
    features: [
      'Publish up to 10 Plugs',
      'Remove NurdsCode branding',
      'Advanced analytics dashboard',
      'Email support (48hr response)',
      'Custom thumbnails',
      'Promotional tools',
      'Priority in search'
    ],
    branding: 'custom',
    supportLevel: 'email',
    analytics: 'advanced'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    priceId: 'price_pro_monthly',
    maxPlugs: Infinity,
    platformFee: 0.10, // 10%
    features: [
      'Unlimited Plugs',
      'Custom domains',
      'API access',
      'Priority support (24hr response)',
      'Beta features access',
      'Affiliate program',
      'Featured placement options',
      'White-label option',
      'Bulk upload tools'
    ],
    branding: 'white_label',
    supportLevel: 'priority',
    analytics: 'full'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceId: 'price_enterprise_monthly',
    maxPlugs: Infinity,
    platformFee: 0.05, // 5%
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom contracts',
      'SLA guarantee (99.9%)',
      'On-premise deployment option',
      'Custom integrations',
      'Volume discounts',
      'Co-marketing opportunities'
    ],
    branding: 'full_white_label',
    supportLevel: 'dedicated',
    analytics: 'enterprise'
  }
};

// Plug pricing models
export const PRICING_MODELS = {
  one_time: {
    id: 'one_time',
    name: 'One-Time Purchase',
    description: 'Buy once, own forever, includes lifetime updates',
    icon: '💳',
    minPrice: 1,
    maxPrice: 9999
  },
  rental: {
    id: 'rental',
    name: 'Rental',
    description: 'Temporary access for a set period',
    icon: '⏰',
    periods: [
      { days: 30, label: '30 Days' },
      { days: 90, label: '90 Days' },
      { days: 365, label: '1 Year' }
    ],
    minPrice: 1
  },
  subscription: {
    id: 'subscription',
    name: 'Subscription',
    description: 'Recurring monthly or yearly access',
    icon: '🔄',
    intervals: ['monthly', 'yearly'],
    minPrice: 1
  },
  freemium: {
    id: 'freemium',
    name: 'Freemium',
    description: 'Free base version with paid upgrades',
    icon: '🎁'
  },
  pay_what_you_want: {
    id: 'pay_what_you_want',
    name: 'Pay What You Want',
    description: 'Let buyers choose their price',
    icon: '💝',
    suggestedPrices: [5, 10, 25, 50]
  },
  nft: {
    id: 'nft',
    name: 'NFT Edition',
    description: 'Limited Web3 collectible with ownership proof',
    icon: '🎨',
    blockchain: ['ethereum', 'polygon', 'base']
  }
};

// Plug categories
export const PLUG_CATEGORIES = [
  { id: 'productivity', name: 'Productivity', icon: '📊', color: '#00D4FF' },
  { id: 'ai_tools', name: 'AI Tools', icon: '🤖', color: '#00FF41' },
  { id: 'business', name: 'Business', icon: '💼', color: '#FFD700' },
  { id: 'creative', name: 'Creative', icon: '🎨', color: '#FF6B6B' },
  { id: 'education', name: 'Education', icon: '📚', color: '#9B59B6' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#E74C3C' },
  { id: 'finance', name: 'Finance', icon: '💰', color: '#27AE60' },
  { id: 'health', name: 'Health & Fitness', icon: '💪', color: '#3498DB' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🏠', color: '#F39C12' },
  { id: 'social', name: 'Social', icon: '👥', color: '#1ABC9C' },
  { id: 'developer', name: 'Developer Tools', icon: '👨‍💻', color: '#8E44AD' },
  { id: 'utilities', name: 'Utilities', icon: '🛠️', color: '#95A5A6' },
  { id: 'security', name: 'Security', icon: '🔒', color: '#2C3E50' },
  { id: 'ecommerce', name: 'E-Commerce', icon: '🛒', color: '#E91E63' },
  { id: 'media', name: 'Media & Video', icon: '📹', color: '#FF5722' }
];

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', rtl: false },
  { code: 'es', name: 'Spanish', native: 'Español', rtl: false },
  { code: 'fr', name: 'French', native: 'Français', rtl: false },
  { code: 'de', name: 'German', native: 'Deutsch', rtl: false },
  { code: 'it', name: 'Italian', native: 'Italiano', rtl: false },
  { code: 'pt', name: 'Portuguese', native: 'Português', rtl: false },
  { code: 'ru', name: 'Russian', native: 'Русский', rtl: false },
  { code: 'zh', name: 'Chinese', native: '中文', rtl: false },
  { code: 'ja', name: 'Japanese', native: '日本語', rtl: false },
  { code: 'ko', name: 'Korean', native: '한국어', rtl: false },
  { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', rtl: false },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', rtl: false },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', rtl: false },
  { code: 'pl', name: 'Polish', native: 'Polski', rtl: false },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', rtl: false },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', rtl: false },
  { code: 'th', name: 'Thai', native: 'ไทย', rtl: false },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', rtl: false },
  { code: 'uk', name: 'Ukrainian', native: 'Українська', rtl: false },
  { code: 'he', name: 'Hebrew', native: 'עברית', rtl: true },
  { code: 'sv', name: 'Swedish', native: 'Svenska', rtl: false },
  { code: 'da', name: 'Danish', native: 'Dansk', rtl: false },
  { code: 'fi', name: 'Finnish', native: 'Suomi', rtl: false },
  { code: 'no', name: 'Norwegian', native: 'Norsk', rtl: false },
  { code: 'cs', name: 'Czech', native: 'Čeština', rtl: false },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', rtl: false },
  { code: 'ro', name: 'Romanian', native: 'Română', rtl: false },
  { code: 'hu', name: 'Hungarian', native: 'Magyar', rtl: false },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', rtl: false }
];

// Security settings
export const SECURITY_CONFIG = {
  codeObfuscation: {
    enabled: true,
    level: 'high', // low, medium, high
    features: [
      'variableRenaming',
      'stringEncryption',
      'controlFlowFlattening',
      'deadCodeInjection',
      'debugProtection'
    ]
  },
  licenseValidation: {
    checkInterval: 3600000, // 1 hour in ms
    offlineGracePeriod: 86400000, // 24 hours
    maxDevices: 3
  },
  domainLocking: {
    enabled: true,
    allowLocalhost: true,
    allowSubdomains: true
  },
  tamperDetection: {
    enabled: true,
    alertOnTamper: true,
    disableOnTamper: true
  }
};

// Deployment options
export const DEPLOYMENT_PROVIDERS = [
  {
    id: 'cloudflare_pages',
    name: 'Cloudflare Pages',
    icon: '☁️',
    defaultDomain: '.pages.dev',
    customDomains: true,
    ssl: true,
    edgeFunctions: true
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    defaultDomain: '.vercel.app',
    customDomains: true,
    ssl: true,
    edgeFunctions: true
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: '◆',
    defaultDomain: '.netlify.app',
    customDomains: true,
    ssl: true,
    edgeFunctions: true
  },
  {
    id: 'self_hosted',
    name: 'Self-Hosted (Download)',
    icon: '📦',
    defaultDomain: null,
    customDomains: true,
    ssl: false, // User's responsibility
    edgeFunctions: false
  }
];

export default {
  CREATOR_TIERS,
  PRICING_MODELS,
  PLUG_CATEGORIES,
  SUPPORTED_LANGUAGES,
  SECURITY_CONFIG,
  DEPLOYMENT_PROVIDERS
};
