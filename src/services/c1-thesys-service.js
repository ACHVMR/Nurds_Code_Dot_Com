// ============================================
// C1 THESYS SERVICE
// Card-Based UI System for Visual Data Display
// ============================================

/**
 * C1 Thesys Integration Service
 * Transforms data into beautiful, interactive cards for:
 * - Agent performance dashboards
 * - Build outputs and results
 * - Token usage visualization
 * - Pricing displays
 * - Analytics and metrics
 */

const C1_API_ENDPOINT = 'https://api.thesys.ai/v1';

export class C1ThesysService {
  constructor() {
    this.apiKey = import.meta.env.VITE_C1_API_KEY;
    this.enabled = import.meta.env.VITE_C1_ENABLED !== 'false';
  }

  /**
   * Generate a card from a prompt
   * @param {string} prompt - Description of the card to create
   * @param {object} data - Data to display in the card
   * @param {string} type - Card type (summary, stat, chart, table, etc.)
   * @returns {Promise<object>} Card component data
   */
  async generateCard(prompt, data = {}, type = 'auto') {
    if (!this.enabled) {
      console.warn('C1 Thesys is disabled');
      return this.fallbackCard(data, type);
    }

    try {
      const response = await fetch(`${C1_API_ENDPOINT}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          data,
          type,
          theme: {
            primary: '#E68961',
            secondary: '#D4A05F',
            active: '#C49350',
            background: '#0F0F0F',
            surface: '#1a1a1a',
            text: '#FFFFFF',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`C1 API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('C1 Thesys error:', error);
      return this.fallbackCard(data, type);
    }
  }

  /**
   * Create Agent Performance Card
   */
  async createAgentCard(agentData) {
    const prompt = `
Create a beautiful agent performance card with:
- Agent name: ${agentData.name}
- Status: ${agentData.status}
- Tasks completed: ${agentData.tasksCompleted}
- Success rate: ${agentData.successRate}%
- Tokens used: ${agentData.tokensUsed?.toLocaleString()}
- Effectiveness level: ${agentData.effectivenessLevel}

Use golden yellow (#E68961) for accents and status indicators.
Show progress bars for success rate and token usage.
Include icon for agent type.
    `;

    return this.generateCard(prompt, agentData, 'agent-performance');
  }

  /**
   * Create Build Output Card
   */
  async createBuildCard(buildData) {
    const prompt = `
Create a build output card displaying:
- Build status: ${buildData.status}
- Duration: ${buildData.duration}
- Files generated: ${buildData.filesGenerated}
- Bundle size: ${buildData.bundleSize}
- Warnings: ${buildData.warnings || 0}
- Errors: ${buildData.errors || 0}

Use golden yellow for success states.
Show progress indicators for build stages.
Include download/deploy action buttons.
    `;

    return this.generateCard(prompt, buildData, 'build-output');
  }

  /**
   * Create Token Usage Dashboard Card
   */
  async createTokenDashboard(tokenData) {
    const prompt = `
Create a token usage dashboard with:
- Total allocated: ${tokenData.allocated?.toLocaleString()} tokens
- Tokens used: ${tokenData.used?.toLocaleString()} (${tokenData.usedPercent}%)
- Tokens remaining: ${tokenData.remaining?.toLocaleString()} (${tokenData.remainingPercent}%)
- Days remaining in period: ${tokenData.daysRemaining}

Breakdown by effectiveness level:
${tokenData.levels?.map(level => 
  `- ${level.emoji} ${level.name}: ${level.tokens.toLocaleString()} tokens (${level.percentage}%)`
).join('\n')}

Use color-coded progress bars:
- Green (>70% remaining)
- Yellow (30-70% remaining)
- Red (<30% remaining)

Display visual charts and gauges.
    `;

    return this.generateCard(prompt, tokenData, 'token-dashboard');
  }

  /**
   * Create Pricing Card
   */
  async createPricingCard(pricingData) {
    const prompt = `
Create a pricing tier card for:
- Tier: ${pricingData.tier}
- Price: $${pricingData.price}/month
- Token allocation: ${pricingData.tokens?.toLocaleString()}
- Features: ${pricingData.features?.join(', ')}
- Build fee: ${pricingData.buildFee}
- Cashback: ${pricingData.cashback}

Highlight current tier with golden yellow.
Show feature comparison.
Include upgrade/downgrade buttons.
    `;

    return this.generateCard(prompt, pricingData, 'pricing');
  }

  /**
   * Create Analytics Chart Card
   */
  async createAnalyticsCard(analyticsData) {
    const prompt = `
Create an analytics chart displaying:
- Metric: ${analyticsData.metric}
- Time period: ${analyticsData.period}
- Current value: ${analyticsData.current}
- Change: ${analyticsData.change}% ${analyticsData.trend}
- Data points: ${analyticsData.dataPoints?.length} values

Show as ${analyticsData.chartType || 'line'} chart.
Use golden yellow for trend lines.
Include interactive tooltips.
    `;

    return this.generateCard(prompt, analyticsData, 'chart');
  }

  /**
   * Create Data Table Card
   */
  async createTableCard(tableData) {
    const prompt = `
Create a data table showing:
- Title: ${tableData.title}
- Columns: ${tableData.columns?.map(c => c.label).join(', ')}
- ${tableData.rows?.length} rows of data
- Sortable: ${tableData.sortable !== false}
- Filterable: ${tableData.filterable !== false}

Use golden yellow for headers and active states.
Include pagination if more than 10 rows.
Show export options.
    `;

    return this.generateCard(prompt, tableData, 'table');
  }

  /**
   * Create Progress Card
   */
  async createProgressCard(progressData) {
    const prompt = `
Create a progress card for:
- Task: ${progressData.task}
- Status: ${progressData.status}
- Progress: ${progressData.percent}%
- Time elapsed: ${progressData.elapsed}
- Time remaining: ${progressData.remaining}
- Current step: ${progressData.currentStep}/${progressData.totalSteps}

Show animated progress bar in golden yellow.
Display current operation.
Include cancel/pause buttons if applicable.
    `;

    return this.generateCard(prompt, progressData, 'progress');
  }

  /**
   * Create Alert/Notification Card
   */
  async createAlertCard(alertData) {
    const prompt = `
Create an alert card:
- Type: ${alertData.type} (info/warning/error/success)
- Title: ${alertData.title}
- Message: ${alertData.message}
- Actions: ${alertData.actions?.map(a => a.label).join(', ')}

Use appropriate colors:
- Info: Blue
- Warning: Yellow
- Error: Red
- Success: Golden yellow (#E68961)
    `;

    return this.generateCard(prompt, alertData, 'alert');
  }

  /**
   * Fallback card renderer (when C1 API unavailable)
   */
  fallbackCard(data, type) {
    return {
      type: 'fallback',
      cardType: type,
      data,
      html: `
        <div class="c1-fallback-card" style="
          background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          border: 2px solid #E68961;
          border-radius: 12px;
          padding: 24px;
          color: white;
        ">
          <h3 style="color: #E68961; margin: 0 0 16px 0;">
            ${data.title || 'Data Display'}
          </h3>
          <pre style="
            background: #0F0F0F;
            padding: 16px;
            border-radius: 8px;
            overflow: auto;
            font-size: 12px;
            line-height: 1.5;
          ">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `,
    };
  }

  /**
   * Batch create multiple cards
   */
  async createCards(cardRequests) {
    return Promise.all(
      cardRequests.map(request => 
        this.generateCard(request.prompt, request.data, request.type)
      )
    );
  }
}

// Singleton instance
export const c1Service = new C1ThesysService();

// Export helper functions for common card types
export const C1Cards = {
  agent: (data) => c1Service.createAgentCard(data),
  build: (data) => c1Service.createBuildCard(data),
  tokens: (data) => c1Service.createTokenDashboard(data),
  pricing: (data) => c1Service.createPricingCard(data),
  analytics: (data) => c1Service.createAnalyticsCard(data),
  table: (data) => c1Service.createTableCard(data),
  progress: (data) => c1Service.createProgressCard(data),
  alert: (data) => c1Service.createAlertCard(data),
};
