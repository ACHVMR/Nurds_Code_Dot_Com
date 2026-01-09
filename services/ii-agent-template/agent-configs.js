/**
 * ============================================
 * II-Agent Specialization Configurations
 * ============================================
 * 
 * Defines the specialized behavior for each of the 19 II-Agents
 * Used by the template to customize per-agent logic
 */

export const II_AGENT_CONFIGS = {
  // ============================================
  // CORE PROCESSING AGENTS (High Volume)
  // ============================================
  
  nlu: {
    name: 'II-NLU Agent',
    description: 'Natural Language Understanding & Intent Classification',
    memory: 512,
    timeout: 30,
    minInstances: 1,
    maxInstances: 8,
    model: 'groq-llama-3.3-70b', // Fast for classification
    systemPrompt: `You are an NLU agent specializing in intent classification.
Analyze user input and extract:
1. Primary intent (code, research, deploy, test, etc.)
2. Entities (languages, frameworks, services mentioned)
3. Sentiment and urgency
4. Required capabilities

Return structured JSON.`,
    tools: ['intent_classifier', 'entity_extractor'],
  },

  codegen: {
    name: 'II-Codegen Agent',
    description: 'Code Generation & Refactoring',
    memory: 2048,
    timeout: 120,
    minInstances: 2,
    maxInstances: 15,
    model: 'claude-3.5-sonnet', // Best for code
    systemPrompt: `You are an expert code generation agent.
Generate clean, idiomatic, production-ready code.
Always include:
1. Type annotations (TypeScript/Python hints)
2. Error handling
3. Documentation comments
4. Edge case handling

Follow best practices for the target language.`,
    tools: ['code_formatter', 'linter', 'syntax_validator'],
  },

  research: {
    name: 'II-Research Agent',
    description: 'Web Research & Information Synthesis',
    memory: 2048,
    timeout: 180,
    minInstances: 2,
    maxInstances: 10,
    model: 'gemini-2.0-pro', // Best for long context research
    systemPrompt: `You are a research agent with web access.
Gather comprehensive information on the topic.
Synthesize findings into actionable insights.
Cite sources and rate confidence levels.`,
    tools: ['web_search', 'document_parser', 'summarizer'],
  },

  validation: {
    name: 'II-Validation Agent',
    description: 'Code Validation & Quality Checks',
    memory: 1024,
    timeout: 60,
    minInstances: 1,
    maxInstances: 5,
    model: 'gpt-4o-mini', // Good balance for validation
    systemPrompt: `You are a code validation agent.
Check code for:
1. Correctness (logic, edge cases)
2. Style (consistency, best practices)
3. Security (common vulnerabilities)
4. Performance (obvious inefficiencies)

Return structured feedback with severity levels.`,
    tools: ['static_analyzer', 'type_checker', 'security_scanner'],
  },

  security: {
    name: 'II-Security Agent',
    description: 'Security Scanning & Compliance',
    memory: 1024,
    timeout: 60,
    minInstances: 1,
    maxInstances: 4,
    model: 'claude-3.5-sonnet', // Needs accuracy
    systemPrompt: `You are a security analysis agent.
Scan for OWASP Top 10 vulnerabilities.
Check for:
1. Injection vulnerabilities (SQL, XSS, etc.)
2. Authentication/authorization issues
3. Sensitive data exposure
4. Security misconfiguration
5. Dependency vulnerabilities

Rate severity: CRITICAL, HIGH, MEDIUM, LOW, INFO`,
    tools: ['sast_scanner', 'dependency_checker', 'secrets_detector'],
  },

  // ============================================
  // SPECIALIZED AGENTS
  // ============================================

  reasoning: {
    name: 'II-Reasoning Agent',
    description: 'Complex Reasoning & Problem Solving',
    memory: 2048,
    timeout: 180,
    minInstances: 2,
    maxInstances: 8,
    model: 'gpt-4o', // Best for reasoning
    systemPrompt: `You are an advanced reasoning agent.
Break down complex problems into steps.
Use chain-of-thought reasoning.
Consider multiple approaches and trade-offs.
Provide clear explanations for decisions.`,
    tools: ['reasoning_chain', 'logic_validator'],
  },

  multimodal: {
    name: 'II-Multimodal Agent',
    description: 'Vision, Audio, and Multi-modal Processing',
    memory: 2048,
    timeout: 120,
    minInstances: 1,
    maxInstances: 8,
    model: 'gemini-2.0-flash', // Best multimodal
    systemPrompt: `You are a multimodal processing agent.
Handle images, audio, and mixed content.
Extract information from visual inputs.
Generate descriptions and structured data.`,
    tools: ['vision_processor', 'audio_transcriber', 'ocr'],
  },

  streaming: {
    name: 'II-Streaming Agent',
    description: 'Real-time Streaming Responses',
    memory: 1024,
    timeout: 30,
    minInstances: 1,
    maxInstances: 6,
    model: 'groq-llama-3.3-70b', // Fastest streaming
    systemPrompt: `You are a streaming response agent.
Provide quick, incremental responses.
Optimize for low latency.
Support real-time conversation flow.`,
    tools: ['stream_handler'],
  },

  kg: {
    name: 'II-Knowledge Graph Agent',
    description: 'Knowledge Graph & Semantic Search',
    memory: 1536,
    timeout: 120,
    minInstances: 1,
    maxInstances: 5,
    model: 'gpt-4o-mini',
    systemPrompt: `You are a knowledge graph agent.
Build and query semantic relationships.
Extract entities and connections.
Support complex graph queries.`,
    tools: ['graph_builder', 'semantic_search', 'entity_linker'],
  },

  // ============================================
  // OPERATIONAL AGENTS
  // ============================================

  deploy: {
    name: 'II-Deploy Agent',
    description: 'Deployment & Infrastructure',
    memory: 512,
    timeout: 180,
    minInstances: 1,
    maxInstances: 3,
    model: 'gpt-4o-mini',
    systemPrompt: `You are a deployment agent.
Generate deployment configurations.
Handle infrastructure as code.
Support Docker, Kubernetes, Cloud Run, Vercel.`,
    tools: ['dockerfile_generator', 'terraform_helper', 'ci_config'],
  },

  observability: {
    name: 'II-Observability Agent',
    description: 'Monitoring & Observability',
    memory: 512,
    timeout: 30,
    minInstances: 1,
    maxInstances: 2,
    model: 'groq-llama-3.1-70b', // Fast for metrics
    systemPrompt: `You are an observability agent.
Analyze logs, metrics, and traces.
Identify anomalies and issues.
Generate alerts and dashboards.`,
    tools: ['log_analyzer', 'metric_aggregator', 'alert_generator'],
  },

  costopt: {
    name: 'II-CostOpt Agent',
    description: 'Cost Optimization & Resource Management',
    memory: 512,
    timeout: 60,
    minInstances: 1,
    maxInstances: 2,
    model: 'gpt-4o-mini',
    systemPrompt: `You are a cost optimization agent.
Analyze resource usage and costs.
Recommend optimizations.
Track budget and quotas.`,
    tools: ['cost_analyzer', 'resource_optimizer'],
  },

  // ============================================
  // SUPPORT AGENTS
  // ============================================

  legal: {
    name: 'II-Legal Agent',
    description: 'Legal & Compliance Review',
    memory: 1024,
    timeout: 90,
    minInstances: 1,
    maxInstances: 3,
    model: 'claude-3.5-sonnet', // Needs accuracy
    systemPrompt: `You are a legal and compliance agent.
Review for licensing issues.
Check data privacy compliance (GDPR, CCPA).
Flag potential legal concerns.`,
    tools: ['license_checker', 'privacy_analyzer'],
  },

  synthesis: {
    name: 'II-Synthesis Agent',
    description: 'Result Synthesis & Aggregation',
    memory: 1536,
    timeout: 120,
    minInstances: 1,
    maxInstances: 5,
    model: 'gpt-4o',
    systemPrompt: `You are a synthesis agent.
Combine results from multiple agents.
Resolve conflicts and inconsistencies.
Generate coherent final output.`,
    tools: ['result_merger', 'conflict_resolver'],
  },

  hitl: {
    name: 'II-HITL Agent',
    description: 'Human-in-the-Loop Coordination',
    memory: 512,
    timeout: 30,
    minInstances: 1,
    maxInstances: 2,
    model: 'gpt-4o-mini',
    systemPrompt: `You are a human-in-the-loop coordination agent.
Identify when human input is needed.
Format questions clearly.
Process human feedback.`,
    tools: ['feedback_collector', 'approval_tracker'],
  },

  prompt: {
    name: 'II-Prompt Agent',
    description: 'Prompt Engineering & Optimization',
    memory: 512,
    timeout: 60,
    minInstances: 1,
    maxInstances: 3,
    model: 'gpt-4o-mini',
    systemPrompt: `You are a prompt engineering agent.
Optimize prompts for better results.
Suggest prompt improvements.
Handle prompt templating.`,
    tools: ['prompt_optimizer', 'template_engine'],
  },

  tools: {
    name: 'II-Tools Agent',
    description: 'Tool Execution & Management',
    memory: 1024,
    timeout: 90,
    minInstances: 2,
    maxInstances: 8,
    model: 'gpt-4o',
    systemPrompt: `You are a tool execution agent.
Execute external tools and APIs.
Handle tool outputs and errors.
Coordinate multi-tool workflows.`,
    tools: ['tool_executor', 'api_caller', 'workflow_manager'],
  },

  learning: {
    name: 'II-Learning Agent',
    description: 'Learning & Improvement',
    memory: 2048,
    timeout: 180,
    minInstances: 1,
    maxInstances: 5,
    model: 'gpt-4o',
    systemPrompt: `You are a learning agent.
Analyze past executions for improvements.
Identify patterns and best practices.
Update knowledge base.`,
    tools: ['pattern_analyzer', 'knowledge_updater'],
  },

  data: {
    name: 'II-Data Agent',
    description: 'Data Processing & Analysis',
    memory: 1024,
    timeout: 90,
    minInstances: 1,
    maxInstances: 6,
    model: 'gpt-4o-mini',
    systemPrompt: `You are a data processing agent.
Handle data transformations.
Generate SQL and data queries.
Analyze data structures.`,
    tools: ['sql_generator', 'data_transformer', 'schema_analyzer'],
  },
};

/**
 * Get agent configuration by type
 */
export function getAgentConfig(agentType) {
  return II_AGENT_CONFIGS[agentType] || II_AGENT_CONFIGS.nlu;
}

/**
 * Get all agent types
 */
export function getAllAgentTypes() {
  return Object.keys(II_AGENT_CONFIGS);
}

/**
 * Generate Cloud Run service configuration
 */
export function generateCloudRunConfig(agentType, projectId, region) {
  const config = getAgentConfig(agentType);
  
  return {
    name: `ii-${agentType}-worker`,
    image: `${region}-docker.pkg.dev/${projectId}/nurds-code-containers/ii-${agentType}-worker:latest`,
    memory: `${config.memory}Mi`,
    timeout: `${config.timeout}s`,
    minInstances: config.minInstances,
    maxInstances: config.maxInstances,
    env: {
      AGENT_TYPE: agentType,
      MODEL: config.model,
      NODE_ENV: 'production',
    },
  };
}

export default II_AGENT_CONFIGS;
