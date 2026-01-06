/**
 * SmelterOS Tool Catalog - Deploy Platform v4.0
 * Complete tool registry for tool calling integration
 * 
 * Organized into 11 Shelves following the Circuit Box architecture
 */

// Shelf definitions
export const SHELVES = {
  shelf1: { 
    id: 'shelf1',
    emoji: '🏪',
    name: 'Orchestration & AI Core',
    description: 'ACHEEVY, Boomer_Angs, LLM Models, Agent Frameworks'
  },
  shelf2: { 
    id: 'shelf2',
    emoji: '🏈',
    name: 'Sports Analytics & Data',
    description: 'ACHIEVEMOR Formula, Sports APIs, Analytics'
  },
  shelf3: { 
    id: 'shelf3',
    emoji: '📋',
    name: 'Planning & Task Management',
    description: 'Workflow automation, CLI tools, Planning systems'
  },
  shelf4: { 
    id: 'shelf4',
    emoji: '💻',
    name: 'Sandbox & Build Environment',
    description: 'Development containers, DevOps, Cloud platforms'
  },
  shelf5: { 
    id: 'shelf5',
    emoji: '🔍',
    name: 'Research & Data Enrichment',
    description: 'AI Research, Data extraction, Knowledge APIs'
  },
  shelf6: { 
    id: 'shelf6',
    emoji: '🎤',
    name: 'UI/Voice & User Experience',
    description: 'Voice APIs, Speech processing, UI frameworks'
  },
  shelf7: { 
    id: 'shelf7',
    emoji: '🖼️',
    name: 'Frontend Rendering',
    description: 'Web frameworks, Styling, Component libraries'
  },
  shelf8: { 
    id: 'shelf8',
    emoji: '💾',
    name: 'Data & Memory Management',
    description: 'Databases, Vector stores, Memory systems'
  },
  shelf9: { 
    id: 'shelf9',
    emoji: '🔒',
    name: 'Security & Audit Systems',
    description: 'Security scanners, Monitoring, Log management'
  },
  shelf10: { 
    id: 'shelf10',
    emoji: '📧',
    name: 'Delivery & Billing',
    description: 'Email services, Payment, Subscriptions'
  },
  shelf11: { 
    id: 'shelf11',
    emoji: '🤖',
    name: 'Autonomous Systems',
    description: 'Agent frameworks, Automation, 3D/VR'
  }
};

// Tool classifications
export const CLASSIFICATIONS = {
  'Internal System': { color: '#FF5E00', icon: '⚙️' },
  'Agent Framework': { color: '#00A651', icon: '🤖' },
  'LLM Gateway': { color: '#5B7FFF', icon: '🌐' },
  'LLM Model': { color: '#9B59B6', icon: '🧠' },
  'UI Framework': { color: '#E67E22', icon: '🖼️' },
  'CLI Tool': { color: '#3498DB', icon: '⌨️' },
  'External API': { color: '#1ABC9C', icon: '🔗' },
  'Data Source': { color: '#F39C12', icon: '📊' },
  'Database': { color: '#E74C3C', icon: '🗄️' },
  'Vector Store': { color: '#8E44AD', icon: '📐' },
  'Security Scanner': { color: '#C0392B', icon: '🛡️' },
  'DevOps Core': { color: '#27AE60', icon: '🚀' },
  'Voice API': { color: '#2980B9', icon: '🎙️' },
  'Email Service': { color: '#D35400', icon: '✉️' },
  'Payment': { color: '#16A085', icon: '💳' },
  'Cloud Platform': { color: '#7F8C8D', icon: '☁️' }
};

// Rating stars helper
export const getRatingStars = (rating) => {
  const match = rating.match(/⭐/g);
  return match ? match.length : 0;
};

// Complete Tool Catalog
export const TOOL_CATALOG = [
  // ============================================
  // 🏪 SHELF 1: ORCHESTRATION & AI CORE
  // ============================================
  {
    id: 'acheevy',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'ACHEEVY',
    description: 'Executive AI engine consultant - Digital CEO of DEPLOY',
    ossSaas: '–',
    install: 'https://chatgpt.com/g/g-6864809475648191b2a094825612c300-acheevy-v-2',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'Internal System',
    featured: true
  },
  {
    id: 'boomer-angs',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'Boomer_Angs',
    description: 'Specialized worker-agent containers with [UserPrefix]_Ang naming',
    ossSaas: '–',
    install: 'internal',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'Internal System',
    featured: true
  },
  {
    id: 'crewai',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'CrewAI',
    description: 'Multi-agent orchestration framework - Best for team-based AI workflows',
    ossSaas: '✅',
    install: 'pip install crewai',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'Agent Framework',
    similar: ['AutoGen', 'LangChain Agents']
  },
  {
    id: 'dmaic-ruleset',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'DMAIC Ruleset',
    description: 'Process loops and methodology for quality control',
    ossSaas: '–',
    install: 'YAML config',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'Internal System'
  },
  {
    id: 'openrouter',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'OpenRouter',
    description: 'Universal LLM API gateway - Best for model switching and cost optimization',
    ossSaas: 'SaaS',
    install: 'pip install openrouter',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'LLM Gateway',
    similar: ['LangChain', 'Direct APIs']
  },
  {
    id: 'ui-tars',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'UI-TARS',
    description: 'Real-time UI generation',
    ossSaas: '✅',
    install: 'pip install ui-tars',
    rating: '⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'UI Framework'
  },
  {
    id: 'gpt-4.1-nano',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'GPT-4.1 NANO',
    description: 'Balanced model for general tasks',
    ossSaas: 'SaaS',
    install: 'via OpenRouter',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'LLM Model'
  },
  {
    id: 'gemini-2.5-pro',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'Gemini 2.5 Pro',
    description: 'Multilingual reasoning model',
    ossSaas: 'SaaS',
    install: 'pip install google-generativeai',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'LLM Model'
  },
  {
    id: 'claude-sonnet-3.7',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'Claude Sonnet 3.7',
    description: '200k context model',
    ossSaas: 'SaaS',
    install: 'pip install anthropic',
    rating: '⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'LLM Model'
  },
  {
    id: 'claude-opus-4',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'Claude Opus 4',
    description: 'Premium reasoning model',
    ossSaas: 'SaaS',
    install: 'pip install anthropic',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Unlimited+',
    classification: 'LLM Model'
  },
  {
    id: 'deepseek-r2',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'DeepSeek R2',
    description: 'Budget-friendly LLM',
    ossSaas: 'SaaS',
    install: 'pip install deepseek-client',
    rating: '⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'LLM Model'
  },
  {
    id: 'grok-4',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'Grok 4',
    description: 'Real-time LLM with search',
    ossSaas: 'SaaS',
    install: 'pip install grok-client',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Superior',
    classification: 'LLM Model'
  },
  {
    id: 'ii-agent',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'ii-agent',
    description: 'Comprehensive intelligent agent framework - Best for autonomous task execution',
    ossSaas: '✅',
    install: 'pip install ii-agent',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'Agent Framework',
    stars: '2.7k',
    similar: ['CrewAI', 'AutoGen']
  },
  {
    id: 'commonground',
    shelf: 'shelf1',
    category: 'Orchestration & AI Core',
    name: 'CommonGround',
    description: 'Multi-agent collaboration platform with observability',
    ossSaas: '✅',
    install: 'pip install commonground',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'Agent Framework',
    stars: '336',
    similar: ['CrewAI', 'Swarm']
  },

  // ============================================
  // 📋 SHELF 3: PLANNING & TASK MANAGEMENT
  // ============================================
  {
    id: 'plandex',
    shelf: 'shelf3',
    category: 'Planning & Task Management',
    name: 'Plandex',
    description: 'Task decomposition system',
    ossSaas: 'SaaS',
    install: 'pip install plandex',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'CLI Tool'
  },
  {
    id: 'n8n',
    shelf: 'shelf3',
    category: 'Planning & Task Management',
    name: 'n8n',
    description: 'Visual workflow automation - Best for complex self-hosted automation',
    ossSaas: '✅',
    install: 'npm i -g n8n',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'CLI Tool',
    similar: ['Zapier', 'Make']
  },
  {
    id: 'gemini-cli',
    shelf: 'shelf3',
    category: 'Planning & Task Management',
    name: 'gemini-cli',
    description: 'Gemini AI in terminal environments',
    ossSaas: '✅',
    install: 'npm install @google/generative-ai',
    rating: '⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'CLI Tool',
    stars: '6k+'
  },

  // ============================================
  // 💻 SHELF 4: SANDBOX & BUILD ENVIRONMENT
  // ============================================
  {
    id: 'daytona',
    shelf: 'shelf4',
    category: 'Sandbox & Build Environment',
    name: 'Daytona',
    description: 'Development containers',
    ossSaas: '✅',
    install: 'curl https://get.daytona.io | bash',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'DevOps Core'
  },
  {
    id: 'modal',
    shelf: 'shelf4',
    category: 'Sandbox & Build Environment',
    name: 'Modal',
    description: 'Serverless job execution for GPU tasks',
    ossSaas: 'SaaS',
    install: 'pip install modal-client',
    rating: '⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'Cloud Platform'
  },
  {
    id: 'docker',
    shelf: 'shelf4',
    category: 'Sandbox & Build Environment',
    name: 'Docker',
    description: 'Containerization platform - Best for environment consistency',
    ossSaas: '✅',
    install: 'docker.com',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'DevOps Core',
    similar: ['Podman', 'LXC']
  },
  {
    id: 'kubernetes',
    shelf: 'shelf4',
    category: 'Sandbox & Build Environment',
    name: 'Kubernetes',
    description: 'Container orchestration',
    ossSaas: '✅',
    install: 'kubectl install',
    rating: '⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'DevOps Core'
  },

  // ============================================
  // 🔍 SHELF 5: RESEARCH & DATA ENRICHMENT
  // ============================================
  {
    id: 'deerflow',
    shelf: 'shelf5',
    category: 'Research & Data Enrichment',
    name: 'Deerflow',
    description: 'Deep research automation',
    ossSaas: 'SaaS',
    install: 'pip install deerflow',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'Agent Framework'
  },
  {
    id: 'tavily',
    shelf: 'shelf5',
    category: 'Research & Data Enrichment',
    name: 'Tavily API',
    description: 'AI-powered search API with intelligent processing',
    ossSaas: 'SaaS',
    install: 'pip install tavily',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'External API',
    similar: ['SerpAPI', 'Perplexity']
  },
  {
    id: 'perplexity',
    shelf: 'shelf5',
    category: 'Research & Data Enrichment',
    name: 'Perplexity API',
    description: 'AI research and Q&A - Best for research-focused queries',
    ossSaas: 'SaaS',
    install: 'pip install perplexity-client',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'External API',
    similar: ['Tavily', 'ChatGPT Search']
  },
  {
    id: 'ii-researcher',
    shelf: 'shelf5',
    category: 'Research & Data Enrichment',
    name: 'ii-researcher',
    description: 'Research agent framework - Best for automated research workflows',
    ossSaas: '✅',
    install: 'pip install ii-researcher',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Agent Framework',
    stars: '432',
    similar: ['Tavily', 'Perplexity']
  },

  // ============================================
  // 🎤 SHELF 6: UI/VOICE & USER EXPERIENCE
  // ============================================
  {
    id: 'vapi-js',
    shelf: 'shelf6',
    category: 'UI/Voice & User Experience',
    name: 'VAPI JS',
    description: 'Voice AI for applications - Best for real-time voice calls',
    ossSaas: 'SaaS',
    install: 'npm i @vapi/sdk',
    rating: '⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'Voice API',
    similar: ['ElevenLabs', 'OpenAI TTS']
  },
  {
    id: 'elevenlabs',
    shelf: 'shelf6',
    category: 'UI/Voice & User Experience',
    name: 'ElevenLabs SDK',
    description: 'Voice synthesis',
    ossSaas: 'SaaS',
    install: 'pip install elevenlabs',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Voice API'
  },
  {
    id: 'nvidia-parakeet',
    shelf: 'shelf6',
    category: 'UI/Voice & User Experience',
    name: 'NVIDIA Parakeet',
    description: 'Real-time voice simulation',
    ossSaas: 'SaaS',
    install: 'pip install parakeet-sdk',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Superior',
    classification: 'Voice API'
  },
  {
    id: 'openai-whisper',
    shelf: 'shelf6',
    category: 'UI/Voice & User Experience',
    name: 'OpenAI Whisper',
    description: 'Speech-to-text',
    ossSaas: '✅',
    install: 'pip install openai-whisper',
    rating: '⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'Voice API'
  },
  {
    id: 'deepgram',
    shelf: 'shelf6',
    category: 'UI/Voice & User Experience',
    name: 'Deepgram',
    description: 'Real-time speech recognition',
    ossSaas: 'SaaS',
    install: 'API integration',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Voice API'
  },
  {
    id: 'chainlit',
    shelf: 'shelf6',
    category: 'UI/Voice & User Experience',
    name: 'Chainlit',
    description: 'Conversational AI interfaces',
    ossSaas: '✅',
    install: 'pip install chainlit',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'UI Framework'
  },

  // ============================================
  // 🖼️ SHELF 7: FRONTEND RENDERING
  // ============================================
  {
    id: 'nextjs',
    shelf: 'shelf7',
    category: 'Frontend Rendering',
    name: 'Next.js',
    description: 'React production framework - Best for full-stack web applications',
    ossSaas: '✅',
    install: 'npx create-next-app',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'UI Framework',
    similar: ['React', 'Nuxt.js']
  },
  {
    id: 'tailwindcss',
    shelf: 'shelf7',
    category: 'Frontend Rendering',
    name: 'TailwindCSS',
    description: 'Utility-first CSS framework',
    ossSaas: '✅',
    install: 'npm i -D tailwindcss',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'UI Framework'
  },
  {
    id: 'shadcn-ui',
    shelf: 'shelf7',
    category: 'Frontend Rendering',
    name: 'Radix UI + shadcn/ui',
    description: 'React component primitives',
    ossSaas: '✅',
    install: 'pnpm add @radix-ui/react-icons shadcn-ui',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'UI Framework'
  },
  {
    id: 'framer-motion',
    shelf: 'shelf7',
    category: 'Frontend Rendering',
    name: 'Framer Motion',
    description: 'Animation library',
    ossSaas: '✅',
    install: 'npm i framer-motion',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'UI Framework'
  },
  {
    id: 'superdesign',
    shelf: 'shelf7',
    category: 'Frontend Rendering',
    name: 'SuperDesign',
    description: 'AI Design Agent for IDEs - Generates UI mockups from natural language',
    ossSaas: '✅',
    install: 'VS Code Extension Install',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'UI Framework',
    stars: '1.7k',
    similar: ['Figma', 'Sketch', 'Adobe XD']
  },

  // ============================================
  // 💾 SHELF 8: DATA & MEMORY MANAGEMENT
  // ============================================
  {
    id: 'supabase',
    shelf: 'shelf8',
    category: 'Data & Memory Management',
    name: 'Supabase',
    description: 'Open-source Firebase alternative with real-time PostgreSQL',
    ossSaas: '✅',
    install: 'npx supabase init',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'Database',
    similar: ['Firebase', 'PlanetScale']
  },
  {
    id: 'drizzle-orm',
    shelf: 'shelf8',
    category: 'Data & Memory Management',
    name: 'Drizzle ORM',
    description: 'Typed SQL mapper',
    ossSaas: '✅',
    install: 'npm i drizzle-orm',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Database'
  },
  {
    id: 'chromadb',
    shelf: 'shelf8',
    category: 'Data & Memory Management',
    name: 'ChromaDB',
    description: 'Vector database for embeddings - Best for local vector storage',
    ossSaas: '✅',
    install: 'pip install chromadb',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Vector Store',
    similar: ['Pinecone', 'Weaviate']
  },
  {
    id: 'pinecone',
    shelf: 'shelf8',
    category: 'Data & Memory Management',
    name: 'Pinecone',
    description: 'Managed vector database - Best for production vector search',
    ossSaas: 'SaaS',
    install: 'pip install pinecone-client',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'Vector Store',
    similar: ['ChromaDB', 'Weaviate']
  },
  {
    id: 'ii-verl',
    shelf: 'shelf8',
    category: 'Data & Memory Management',
    name: 'ii_verl',
    description: 'Production RL training - Best for LLM reinforcement learning',
    ossSaas: '✅',
    install: 'pip install verl',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Superior',
    classification: 'Internal System',
    stars: '1.9k',
    similar: ['Ray RLlib', 'Stable Baselines']
  },

  // ============================================
  // 🔒 SHELF 9: SECURITY & AUDIT SYSTEMS
  // ============================================
  {
    id: 'snyk-cli',
    shelf: 'shelf9',
    category: 'Security & Audit Systems',
    name: 'Snyk-CLI',
    description: 'Security vulnerability scanner - Best for dependency security',
    ossSaas: 'SaaS',
    install: 'npm i -g snyk',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Security Scanner',
    similar: ['SonarQube', 'Veracode']
  },
  {
    id: 'trivy',
    shelf: 'shelf9',
    category: 'Security & Audit Systems',
    name: 'Trivy',
    description: 'Container security scanning',
    ossSaas: '✅',
    install: 'brew install trivy',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Security Scanner'
  },
  {
    id: 'otel-exporter',
    shelf: 'shelf9',
    category: 'Security & Audit Systems',
    name: 'OTEL Exporter',
    description: 'OpenTelemetry monitoring',
    ossSaas: '✅',
    install: 'pip install opentelemetry-exporter-otlp',
    rating: '⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Security Scanner'
  },

  // ============================================
  // 📧 SHELF 10: DELIVERY & BILLING
  // ============================================
  {
    id: 'resend',
    shelf: 'shelf10',
    category: 'Delivery & Billing',
    name: 'Resend',
    description: 'Developer-focused email API - Best for transactional emails',
    ossSaas: 'SaaS',
    install: 'npm i resend',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'All Tiers',
    classification: 'Email Service',
    similar: ['SendGrid', 'Mailgun']
  },
  {
    id: 'stripe',
    shelf: 'shelf10',
    category: 'Delivery & Billing',
    name: 'Stripe',
    description: 'Payment processing',
    ossSaas: 'SaaS',
    install: 'npm i stripe',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Payment'
  },
  {
    id: 'revenuecat',
    shelf: 'shelf10',
    category: 'Delivery & Billing',
    name: 'RevenueCat',
    description: 'Subscription management',
    ossSaas: 'SaaS',
    install: 'pod install RevenueCat',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Payment'
  },

  // ============================================
  // 🤖 SHELF 11: AUTONOMOUS SYSTEMS
  // ============================================
  {
    id: 'langchain',
    shelf: 'shelf11',
    category: 'Autonomous Systems',
    name: 'LangChain',
    description: 'LLM application framework - Best for RAG and chain-based workflows',
    ossSaas: '✅',
    install: 'pip install langchain',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Agent Framework',
    similar: ['LlamaIndex', 'Haystack']
  },
  {
    id: 'llamaindex',
    shelf: 'shelf11',
    category: 'Autonomous Systems',
    name: 'LlamaIndex',
    description: 'Data framework for LLMs - Best for document indexing and retrieval',
    ossSaas: '✅',
    install: 'pip install llama-index',
    rating: '⭐⭐⭐⭐',
    tiers: 'Entry+',
    classification: 'Agent Framework',
    similar: ['LangChain', 'Haystack']
  },
  {
    id: 'langgraph',
    shelf: 'shelf11',
    category: 'Autonomous Systems',
    name: 'LangGraph',
    description: 'Graph-based agent workflows',
    ossSaas: '✅',
    install: 'pip install langgraph',
    rating: '⭐⭐⭐⭐',
    tiers: 'Mid+',
    classification: 'Agent Framework'
  },
  {
    id: 'nvidia-omniverse',
    shelf: 'shelf11',
    category: 'Autonomous Systems',
    name: 'NVIDIA Omniverse',
    description: 'Real-time 3D environment',
    ossSaas: 'SaaS',
    install: 'Omniverse Launcher',
    rating: '⭐⭐⭐⭐⭐',
    tiers: 'Superior',
    classification: 'Cloud Platform'
  }
];

// Get tools by shelf
export const getToolsByShelf = (shelfId) => {
  return TOOL_CATALOG.filter(t => t.shelf === shelfId);
};

// Get featured tools
export const getFeaturedTools = () => {
  return TOOL_CATALOG.filter(t => t.featured);
};

// Search tools
export const searchTools = (query) => {
  const lowerQuery = query.toLowerCase();
  return TOOL_CATALOG.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery)
  );
};

// Get tool by ID
export const getToolById = (id) => {
  return TOOL_CATALOG.find(t => t.id === id);
};

export default TOOL_CATALOG;
