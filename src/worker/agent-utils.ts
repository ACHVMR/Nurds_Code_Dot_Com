// Boomer_Angs Naming Ceremony System
// Every agent created via Deploy receives [UserPrefix]_Ang naming

export class BoomerAngNamingCeremony {
  /**
   * Generate agent name following Boomer_Angs convention
   * @param userPrefix - User-provided prefix (e.g., "CustomerSupport", "InvoiceBot")
   * @returns Formatted agent name with _Ang suffix
   */
  static generateName(userPrefix: string): string {
    // Clean and format the prefix
    const cleaned = userPrefix
      .trim()
      .replace(/[^a-zA-Z0-9_]/g, '_') // Remove special chars
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

    // Convert to PascalCase
    const pascalCase = cleaned
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    // Add _Ang suffix
    return `${pascalCase}_Ang`;
  }

  /**
   * Validate agent name format
   */
  static isValid(name: string): boolean {
    const pattern = /^[A-Z][a-zA-Z0-9]*_Ang$/;
    return pattern.test(name);
  }

  /**
   * Extract user prefix from agent name
   */
  static extractPrefix(agentName: string): string | null {
    if (!this.isValid(agentName)) return null;
    return agentName.replace(/_Ang$/, '');
  }

  /**
   * Generate agent config based on type
   */
  static generateConfig(type: 'simple' | 'workflow' | 'custom'): Record<string, any> {
    const configs = {
      simple: {
        type: 'simple',
        description: 'Single-purpose AI agent for specific tasks',
        capabilities: ['chat', 'query', 'analysis'],
        complexity: 'low',
      },
      workflow: {
        type: 'workflow',
        description: 'Multi-step workflow orchestration agent',
        capabilities: ['chat', 'workflow', 'orchestration', 'handoffs'],
        complexity: 'medium',
      },
      custom: {
        type: 'custom',
        description: 'Fully customizable agent with advanced capabilities',
        capabilities: ['chat', 'workflow', 'tools', 'memory', 'plugins'],
        complexity: 'high',
      },
    };

    return configs[type] || configs.simple;
  }

  /**
   * Select best framework for agent type
   */
  static selectFramework(
    type: 'simple' | 'workflow' | 'custom',
    framework: string = 'auto'
  ): string {
    if (framework !== 'auto') return framework;

    // Auto-select based on type
    const recommendations = {
      simple: 'openai', // OpenAI Agents SDK for simple agents
      workflow: 'crewai', // CrewAI for multi-agent workflows
      custom: 'boomer_angs', // Custom Boomer_Angs for full control
    };

    return recommendations[type] || 'boomer_angs';
  }
}

// Agent framework detection and routing
export class AgentFrameworkRouter {
  private static frameworks = {
    crewai: {
      name: 'CrewAI',
      maturity: 'high',
      best_for: 'Multi-agent workflows, production-ready',
      install: 'pip install crewai',
    },
    microsoft: {
      name: 'Microsoft Agent Framework',
      maturity: 'very-high',
      best_for: 'Enterprise governance, long-running tasks',
      install: 'npm install @microsoft/agent-framework',
    },
    openai: {
      name: 'OpenAI Agents SDK',
      maturity: 'high',
      best_for: 'OpenAI ecosystem, GPT-4 agents',
      install: 'pip install openai-agents',
    },
    deerflow: {
      name: 'DeerFlow',
      maturity: 'medium',
      best_for: 'Workflow automation, visual builder',
      install: 'npm install deerflow',
    },
    google_adk: {
      name: 'Google ADK',
      maturity: 'medium',
      best_for: 'Google Cloud native agents',
      install: 'pip install google-adk',
    },
    modelscope: {
      name: 'ModelScope-Agent',
      maturity: 'low',
      best_for: 'Research, experimental',
      install: 'pip install modelscope-agent',
    },
    boomer_angs: {
      name: 'Boomer_Angs (Custom)',
      maturity: 'production',
      best_for: 'Deploy-native agents with full control',
      install: 'Built-in (no installation required)',
    },
  };

  static getFrameworkInfo(framework: string) {
    return this.frameworks[framework] || this.frameworks.boomer_angs;
  }

  static getAllFrameworks() {
    return Object.entries(this.frameworks).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }

  static isSupported(framework: string): boolean {
    return framework in this.frameworks;
  }
}

// Circuit breaker health checker
export class CircuitBreakerMonitor {
  /**
   * Check health of a service endpoint
   */
  static async checkHealth(endpoint: string, timeout = 5000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get circuit breaker status from Supabase
   */
  static async getCircuitStatus(supabase: any): Promise<any[]> {
    const { data, error } = await supabase
      .from('circuit_breakers')
      .select('*')
      .order('tier', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update circuit breaker status
   */
  static async updateCircuitStatus(
    supabase: any,
    breakerId: string,
    status: 'on' | 'off' | 'error',
    errorCount = 0
  ): Promise<void> {
    await supabase
      .from('circuit_breakers')
      .update({
        status,
        error_count: errorCount,
        last_check: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', breakerId);
  }
}
