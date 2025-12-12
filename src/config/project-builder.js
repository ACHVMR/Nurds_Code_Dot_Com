/**
 * Project Builder Pipeline - Cost & Time Estimation
 * Estimates resources needed to build full-stack applications
 */

// Complexity tiers for different project types
export const PROJECT_TEMPLATES = {
  'landing-page': {
    name: 'Landing Page',
    description: 'Single page marketing site',
    estimatedTokens: 15000,
    estimatedTime: '5-10 minutes',
    components: ['Hero', 'Features', 'CTA', 'Footer'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    complexity: 1
  },
  'portfolio': {
    name: 'Portfolio Website',
    description: 'Personal portfolio with projects gallery',
    estimatedTokens: 35000,
    estimatedTime: '15-25 minutes',
    components: ['Header', 'About', 'Projects', 'Contact', 'Footer'],
    stack: ['React', 'CSS', 'Vite'],
    complexity: 2
  },
  'blog': {
    name: 'Blog Platform',
    description: 'Full blog with CMS capabilities',
    estimatedTokens: 75000,
    estimatedTime: '30-45 minutes',
    components: ['Auth', 'PostList', 'PostEditor', 'Comments', 'Admin'],
    stack: ['React', 'Supabase', 'Markdown'],
    complexity: 3
  },
  'e-commerce': {
    name: 'E-Commerce Store',
    description: 'Full shopping experience with checkout',
    estimatedTokens: 150000,
    estimatedTime: '1-2 hours',
    components: ['ProductCatalog', 'Cart', 'Checkout', 'Payments', 'Orders', 'Admin'],
    stack: ['React', 'Supabase', 'Stripe', 'Cloudflare Workers'],
    complexity: 4
  },
  'saas-dashboard': {
    name: 'SaaS Dashboard',
    description: 'Full SaaS application with auth and billing',
    estimatedTokens: 250000,
    estimatedTime: '2-4 hours',
    components: ['Auth', 'Dashboard', 'Analytics', 'Settings', 'Billing', 'API'],
    stack: ['React', 'Supabase', 'Stripe', 'Cloudflare Workers', 'D1'],
    complexity: 5
  },
  'ai-chatbot': {
    name: 'AI Chatbot App',
    description: 'Conversational AI application',
    estimatedTokens: 100000,
    estimatedTime: '45-90 minutes',
    components: ['Chat UI', 'MessageHistory', 'ModelSelector', 'Settings'],
    stack: ['React', 'OpenAI/Anthropic', 'Supabase', 'WebSockets'],
    complexity: 3
  },
  'custom': {
    name: 'Custom Project',
    description: 'Build from your specifications',
    estimatedTokens: null, // Calculated dynamically
    estimatedTime: 'Varies',
    components: [],
    stack: [],
    complexity: null
  }
};

// Build phases with typical time allocations
export const BUILD_PHASES = [
  { id: 'analysis', name: 'Analyzing Requirements', weight: 0.05, icon: '🔍' },
  { id: 'architecture', name: 'Designing Architecture', weight: 0.10, icon: '📐' },
  { id: 'scaffolding', name: 'Creating Project Structure', weight: 0.05, icon: '📁' },
  { id: 'components', name: 'Building Components', weight: 0.35, icon: '🧩' },
  { id: 'styling', name: 'Applying Styles', weight: 0.15, icon: '🎨' },
  { id: 'integration', name: 'Integrating Services', weight: 0.15, icon: '🔌' },
  { id: 'testing', name: 'Testing & Validation', weight: 0.10, icon: '🧪' },
  { id: 'deployment', name: 'Preparing for Deploy', weight: 0.05, icon: '🚀' }
];

/**
 * Estimate project cost based on description and selected model
 */
export function estimateProjectCost(description, modelId, options = {}) {
  const wordCount = description.split(/\s+/).length;
  const complexityMultiplier = detectComplexity(description);
  
  // Base token estimation
  let estimatedInputTokens = wordCount * 1.5; // User prompt
  let estimatedOutputTokens = 0;
  
  // Estimate output based on detected features
  const features = detectFeatures(description);
  
  features.forEach(feature => {
    estimatedOutputTokens += feature.tokens;
  });
  
  // Apply complexity multiplier
  estimatedOutputTokens *= complexityMultiplier;
  
  // Get model pricing
  const modelCosts = getModelCosts(modelId);
  
  const inputCost = (estimatedInputTokens / 1000) * modelCosts.input;
  const outputCost = (estimatedOutputTokens / 1000) * modelCosts.output;
  
  // Time estimation (tokens per second varies by model)
  const tokensPerSecond = modelCosts.speed === 'fast' ? 100 : modelCosts.speed === 'ultra-fast' ? 200 : 50;
  const estimatedSeconds = estimatedOutputTokens / tokensPerSecond;
  
  // Add buffer for multi-turn conversations and iterations
  const iterationBuffer = options.iterations || 3;
  const totalCost = (inputCost + outputCost) * iterationBuffer;
  const totalTime = estimatedSeconds * iterationBuffer;
  
  return {
    estimatedInputTokens: Math.round(estimatedInputTokens * iterationBuffer),
    estimatedOutputTokens: Math.round(estimatedOutputTokens * iterationBuffer),
    inputCost: inputCost * iterationBuffer,
    outputCost: outputCost * iterationBuffer,
    totalCost: Math.round(totalCost * 100) / 100,
    estimatedTimeSeconds: Math.round(totalTime),
    estimatedTimeFormatted: formatTime(totalTime),
    complexity: complexityMultiplier,
    features: features.map(f => f.name),
    model: modelId,
    breakdown: {
      perIteration: {
        input: inputCost,
        output: outputCost,
        total: inputCost + outputCost
      },
      iterations: iterationBuffer
    }
  };
}

function detectComplexity(description) {
  const complexityIndicators = {
    simple: ['simple', 'basic', 'minimal', 'single page', 'landing'],
    medium: ['dashboard', 'blog', 'portfolio', 'gallery', 'form'],
    complex: ['e-commerce', 'saas', 'marketplace', 'social', 'real-time'],
    enterprise: ['enterprise', 'multi-tenant', 'analytics', 'ai', 'machine learning']
  };
  
  const lowerDesc = description.toLowerCase();
  
  if (complexityIndicators.enterprise.some(k => lowerDesc.includes(k))) return 3.0;
  if (complexityIndicators.complex.some(k => lowerDesc.includes(k))) return 2.0;
  if (complexityIndicators.medium.some(k => lowerDesc.includes(k))) return 1.5;
  return 1.0;
}

function detectFeatures(description) {
  const featurePatterns = [
    { pattern: /auth|login|signup|register/i, name: 'Authentication', tokens: 15000 },
    { pattern: /payment|stripe|checkout|billing/i, name: 'Payments', tokens: 20000 },
    { pattern: /database|supabase|storage/i, name: 'Database', tokens: 12000 },
    { pattern: /api|backend|server/i, name: 'API/Backend', tokens: 18000 },
    { pattern: /dashboard|admin|analytics/i, name: 'Dashboard', tokens: 25000 },
    { pattern: /chat|messaging|real-?time/i, name: 'Real-time', tokens: 15000 },
    { pattern: /video|image|media|upload/i, name: 'Media Handling', tokens: 10000 },
    { pattern: /search|filter|sort/i, name: 'Search/Filter', tokens: 8000 },
    { pattern: /responsive|mobile/i, name: 'Responsive Design', tokens: 5000 },
    { pattern: /dark\s*mode|theme/i, name: 'Theming', tokens: 4000 },
    { pattern: /animation|transition/i, name: 'Animations', tokens: 6000 },
    { pattern: /form|input|validation/i, name: 'Forms', tokens: 8000 },
    { pattern: /chart|graph|visualization/i, name: 'Data Viz', tokens: 12000 },
    { pattern: /email|notification/i, name: 'Notifications', tokens: 8000 },
    { pattern: /ai|chatbot|llm|gpt/i, name: 'AI Integration', tokens: 15000 }
  ];
  
  return featurePatterns.filter(fp => fp.pattern.test(description));
}

function getModelCosts(modelId) {
  // Default costs if model not found
  const defaults = { input: 0.003, output: 0.015, speed: 'medium' };
  
  // This would normally import from model-garden.js
  const modelCosts = {
    'gpt-4o': { input: 0.005, output: 0.015, speed: 'medium' },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006, speed: 'fast' },
    'claude-3-5-sonnet': { input: 0.003, output: 0.015, speed: 'medium' },
    'claude-3-5-haiku': { input: 0.0008, output: 0.004, speed: 'fast' },
    'gemini-2.0-flash': { input: 0.0001, output: 0.0004, speed: 'fast' },
    'llama-3.3-70b-versatile': { input: 0.00059, output: 0.00079, speed: 'ultra-fast' },
    'deepseek-v3': { input: 0.00014, output: 0.00028, speed: 'fast' }
  };
  
  return modelCosts[modelId] || defaults;
}

function formatTime(seconds) {
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export default {
  PROJECT_TEMPLATES,
  BUILD_PHASES,
  estimateProjectCost
};
