/**
 * ACP Router - Agentic Communication Protocol for agent-to-agent messaging
 * Replaces MCP with Deploy-native standard
 */

export interface ACPMessage {
  id: string;
  sender: string;
  receiver: string;
  action: string;
  payload: any;
  traceId: string;
  timestamp: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface ACPLedgerEntry {
  messageId: string;
  sender: string;
  receiver: string;
  action: string;
  traceId: string;
  timestamp: number;
  status: 'pending' | 'delivered' | 'failed' | 'timeout';
  error?: string;
}

export interface Agent {
  name: string;
  role: string;
  capabilities: string[];
  tier: string;
  onMessage: (message: ACPMessage) => Promise<any>;
}

/**
 * ACP Router - Central hub for agent-to-agent communication
 * Implements Charter/Ledger logging for compliance and tracing
 */
export class ACPRouter {
  private agents: Map<string, Agent>;
  private ledger: ACPLedgerEntry[];
  private messageQueue: ACPMessage[];
  
  constructor() {
    this.agents = new Map();
    this.ledger = [];
    this.messageQueue = [];
  }
  
  /**
   * Register an agent with the router
   */
  register(agent: Agent): void {
    console.log(`[ACP Router] Registering agent: ${agent.name} (${agent.role})`);
    this.agents.set(agent.name, agent);
  }
  
  /**
   * Unregister an agent
   */
  unregister(agentName: string): void {
    console.log(`[ACP Router] Unregistering agent: ${agentName}`);
    this.agents.delete(agentName);
  }
  
  /**
   * Route message from sender to receiver
   * Logs to Charter/Ledger for compliance
   */
  async route(message: ACPMessage): Promise<any> {
    console.log(`[ACP Router] Routing message ${message.id} from ${message.sender} to ${message.receiver}`);
    
    // Log to ledger (Charter compliance)
    const ledgerEntry: ACPLedgerEntry = {
      messageId: message.id,
      sender: message.sender,
      receiver: message.receiver,
      action: message.action,
      traceId: message.traceId,
      timestamp: message.timestamp,
      status: 'pending'
    };
    this.ledger.push(ledgerEntry);
    
    // Find receiver
    const receiver = this.agents.get(message.receiver);
    
    if (!receiver) {
      const error = `Agent ${message.receiver} not found`;
      console.error(`[ACP Router] ${error}`);
      ledgerEntry.status = 'failed';
      ledgerEntry.error = error;
      throw new Error(error);
    }
    
    try {
      // Route to receiver's message handler
      const result = await receiver.onMessage(message);
      
      // Update ledger entry
      ledgerEntry.status = 'delivered';
      
      console.log(`[ACP Router] Message ${message.id} delivered successfully`);
      
      return result;
      
    } catch (error) {
      // Log failure to ledger
      ledgerEntry.status = 'failed';
      ledgerEntry.error = error instanceof Error ? error.message : String(error);
      
      console.error(`[ACP Router] Failed to deliver message ${message.id}:`, error);
      
      throw error;
    }
  }
  
  /**
   * Broadcast message to all agents with matching capability
   */
  async broadcast(message: Omit<ACPMessage, 'receiver'>, capability: string): Promise<any[]> {
    const recipients = Array.from(this.agents.values())
      .filter(agent => agent.capabilities.includes(capability));
    
    if (recipients.length === 0) {
      console.warn(`[ACP Router] No agents found with capability: ${capability}`);
      return [];
    }
    
    console.log(`[ACP Router] Broadcasting to ${recipients.length} agents with capability: ${capability}`);
    
    const results = await Promise.allSettled(
      recipients.map(agent =>
        this.route({ ...message, receiver: agent.name } as ACPMessage)
      )
    );
    
    return results.map(result =>
      result.status === 'fulfilled' ? result.value : null
    ).filter(Boolean);
  }
  
  /**
   * Get ledger entries for a specific trace ID (compliance audit)
   */
  getTraceHistory(traceId: string): ACPLedgerEntry[] {
    return this.ledger.filter(entry => entry.traceId === traceId);
  }
  
  /**
   * Get full ledger (compliance audit)
   */
  getLedger(): ACPLedgerEntry[] {
    return [...this.ledger];
  }
  
  /**
   * Get registered agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * Find agents by capability
   */
  findByCapability(capability: string): Agent[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.capabilities.includes(capability));
  }
  
  /**
   * Create ACP message with auto-generated ID and timestamp
   */
  static createMessage(
    sender: string,
    receiver: string,
    action: string,
    payload: any,
    traceId?: string,
    priority: ACPMessage['priority'] = 'normal'
  ): ACPMessage {
    return {
      id: crypto.randomUUID(),
      sender,
      receiver,
      action,
      payload,
      traceId: traceId || crypto.randomUUID(),
      timestamp: Date.now(),
      priority
    };
  }
}

/**
 * Example Boomer_Ang agents
 */

// PickerAng - Pattern selection specialist
export const PickerAng: Agent = {
  name: 'PickerAng',
  role: 'pattern-selection',
  capabilities: ['analyze-patterns', 'select-stack'],
  tier: 'tier-6-orchestration',
  onMessage: async (message: ACPMessage) => {
    console.log('[PickerAng] Received message:', message.action);
    
    if (message.action === 'select-patterns') {
      // Pattern selection logic
      const { competitors } = message.payload;
      return {
        patterns: ['react', 'vite', 'tailwind', 'supabase'],
        confidence: 0.95
      };
    }
    
    throw new Error(`Unknown action: ${message.action}`);
  }
};

// BuildsmithAng - Code scaffolding specialist
export const BuildsmithAng: Agent = {
  name: 'BuildsmithAng',
  role: 'code-generation',
  capabilities: ['scaffold', 'generate-code'],
  tier: 'tier-6-orchestration',
  onMessage: async (message: ACPMessage) => {
    console.log('[BuildsmithAng] Received message:', message.action);
    
    if (message.action === 'generate-scaffold') {
      const { patterns } = message.payload;
      // Generate scaffold based on patterns
      return {
        files: [
          { path: 'src/App.jsx', content: '/* React app */' },
          { path: 'package.json', content: '{}' }
        ]
      };
    }
    
    throw new Error(`Unknown action: ${message.action}`);
  }
};

// ACHEEVY - Orchestrator
export const ACHEEVY: Agent = {
  name: 'ACHEEVY',
  role: 'orchestrator',
  capabilities: ['orchestrate', 'coordinate', 'analyze-competitors'],
  tier: 'tier-6-orchestration',
  onMessage: async (message: ACPMessage) => {
    console.log('[ACHEEVY] Received message:', message.action);
    
    if (message.action === 'reimagine') {
      // Orchestrate RE-IMAGINE flow
      const { userIdea, competitors } = message.payload;
      
      // Step 1: Analyze competitors (ACHEEVY's job)
      const analysis = {
        patterns: ['modern-stack', 'cloud-native'],
        technologies: ['react', 'cloudflare', 'supabase']
      };
      
      return { analysis, status: 'orchestration-complete' };
    }
    
    throw new Error(`Unknown action: ${message.action}`);
  }
};

// Example usage
const router = new ACPRouter();

// Register House of ANG agents
router.register(ACHEEVY);
router.register(PickerAng);
router.register(BuildsmithAng);

// Example: ACHEEVY orchestrates RE-IMAGINE flow
async function exampleReimagineFlow() {
  const traceId = crypto.randomUUID();
  
  // Step 1: User triggers RE-IMAGINE
  const acheeevyMessage = ACPRouter.createMessage(
    'user',
    'ACHEEVY',
    'reimagine',
    {
      userIdea: 'Build a marketplace like Airbnb',
      competitors: ['airbnb.com', 'vrbo.com']
    },
    traceId
  );
  
  const acheeevyResult = await router.route(acheeevyMessage);
  
  // Step 2: ACHEEVY → PickerAng (pattern selection)
  const pickerMessage = ACPRouter.createMessage(
    'ACHEEVY',
    'PickerAng',
    'select-patterns',
    { competitors: acheeevyResult.analysis },
    traceId
  );
  
  const patterns = await router.route(pickerMessage);
  
  // Step 3: PickerAng → BuildsmithAng (scaffold generation)
  const buildsmithMessage = ACPRouter.createMessage(
    'PickerAng',
    'BuildsmithAng',
    'generate-scaffold',
    { patterns: patterns.patterns },
    traceId
  );
  
  const scaffold = await router.route(buildsmithMessage);
  
  // Step 4: Audit ledger
  const traceHistory = router.getTraceHistory(traceId);
  console.log('[ACP Router] Trace history:', traceHistory);
  
  return scaffold;
}

export { router as ACPRouterInstance };
