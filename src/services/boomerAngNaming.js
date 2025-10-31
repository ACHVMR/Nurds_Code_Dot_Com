/**
 * Boomer_Angs Naming Ceremony System
 * Every agent created via Deploy receives a unique naming ceremony:
 * [UserPrefix]_Ang suffix
 * 
 * Examples:
 * - CustomerSupport_Ang
 * - InvoiceBot_Ang
 * - SalesAssistant_Ang
 * - ResearchAnalyst_Ang
 */

export class BoomerAngNamingCeremony {
  constructor() {
    this.suffix = '_Ang';
    this.reservedPrefixes = [
      'ACHEEVY',
      'NTNTN',
      'System',
      'Admin',
      'Root',
      'Deploy',
      'Internal'
    ];
  }

  /**
   * Validate user-provided prefix
   * @param {string} prefix - User's chosen agent name prefix
   * @returns {Object} - Validation result with errors if any
   */
  validatePrefix(prefix) {
    const errors = [];

    // Must not be empty
    if (!prefix || prefix.trim().length === 0) {
      errors.push('Agent name prefix cannot be empty');
    }

    // Must be alphanumeric with underscores only
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(prefix)) {
      errors.push('Agent name must start with a letter and contain only letters, numbers, and underscores');
    }

    // Length constraints
    if (prefix.length < 3) {
      errors.push('Agent name prefix must be at least 3 characters');
    }
    if (prefix.length > 32) {
      errors.push('Agent name prefix must be 32 characters or less');
    }

    // Check reserved prefixes
    const upperPrefix = prefix.toUpperCase();
    if (this.reservedPrefixes.some(reserved => upperPrefix.startsWith(reserved.toUpperCase()))) {
      errors.push(`Prefix "${prefix}" is reserved for system use`);
    }

    // Cannot end with _Ang (would create duplicate suffix)
    if (prefix.toLowerCase().endsWith('_ang')) {
      errors.push('Prefix cannot end with "_Ang" (this is added automatically)');
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: this.sanitizePrefix(prefix)
    };
  }

  /**
   * Sanitize prefix by converting to PascalCase
   * @param {string} prefix - Raw user input
   * @returns {string} - Sanitized prefix
   */
  sanitizePrefix(prefix) {
    if (!prefix) return '';

    // Convert to PascalCase
    return prefix
      .split(/[_\s-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Generate full agent name with naming ceremony
   * @param {string} userPrefix - User's chosen prefix
   * @returns {Object} - Generated agent name with metadata
   */
  generateAgentName(userPrefix) {
    const validation = this.validatePrefix(userPrefix);

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        agentName: null
      };
    }

    const sanitizedPrefix = validation.sanitized;
    const fullName = `${sanitizedPrefix}${this.suffix}`;
    const timestamp = new Date().toISOString();

    return {
      success: true,
      agentName: fullName,
      prefix: sanitizedPrefix,
      suffix: this.suffix,
      createdAt: timestamp,
      metadata: {
        userInput: userPrefix,
        sanitized: sanitizedPrefix,
        ceremony: 'Boomer_Ang Naming Convention v1.0',
        pattern: '[UserPrefix]_Ang'
      }
    };
  }

  /**
   * Extract prefix from full agent name
   * @param {string} agentName - Full agent name (e.g., "CustomerSupport_Ang")
   * @returns {string|null} - Extracted prefix or null if invalid
   */
  extractPrefix(agentName) {
    if (!agentName || !agentName.endsWith(this.suffix)) {
      return null;
    }
    return agentName.slice(0, -this.suffix.length);
  }

  /**
   * Check if a name follows Boomer_Ang convention
   * @param {string} agentName - Name to check
   * @returns {boolean}
   */
  isBoomerAngName(agentName) {
    return typeof agentName === 'string' && agentName.endsWith(this.suffix);
  }

  /**
   * Generate suggested prefixes based on agent type
   * @param {string} agentType - Type of agent (e.g., 'customer_support', 'sales', 'research')
   * @returns {string[]} - Array of suggested prefixes
   */
  suggestPrefixes(agentType) {
    const suggestions = {
      customer_support: ['CustomerSupport', 'SupportBot', 'HelpDesk', 'ServiceAgent'],
      sales: ['SalesAssistant', 'LeadGenerator', 'DealCloser', 'SalesBot'],
      research: ['ResearchAnalyst', 'DataGatherer', 'InsightFinder', 'IntelAgent'],
      code: ['CodeReviewer', 'BugFixer', 'TestGenerator', 'DevAssistant'],
      content: ['ContentWriter', 'BlogGenerator', 'CopyCreator', 'EditorBot'],
      analytics: ['DataAnalyst', 'MetricsTracker', 'InsightEngine', 'AnalyticsBot'],
      workflow: ['WorkflowManager', 'TaskOrchestrator', 'ProcessBot', 'AutomationAgent']
    };

    return suggestions[agentType] || ['CustomAgent', 'SmartBot', 'AIAssistant'];
  }

  /**
   * Generate agent naming ceremony certificate
   * @param {Object} agentInfo - Agent information from generateAgentName()
   * @returns {string} - Certificate text
   */
  generateCertificate(agentInfo) {
    if (!agentInfo.success) {
      return 'Invalid agent information';
    }

    return `
╔════════════════════════════════════════════════════════════╗
║           BOOMER_ANG NAMING CEREMONY CERTIFICATE           ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Agent Name: ${agentInfo.agentName.padEnd(48)} ║
║  Prefix:     ${agentInfo.prefix.padEnd(48)} ║
║  Ceremony:   Boomer_Ang Naming Convention v1.0             ║
║  Created:    ${agentInfo.createdAt.padEnd(48)} ║
║                                                            ║
║  Pattern:    [UserPrefix]_Ang                              ║
║  Status:     ✓ Naming Ceremony Complete                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

This agent has been officially recognized under the Deploy Platform
Boomer_Ang naming convention and is ready for deployment.
    `.trim();
  }
}

// Export singleton instance
export const namingCeremony = new BoomerAngNamingCeremony();

// Example usage:
/*
import { namingCeremony } from './boomerAngNaming';

// Generate agent name
const result = namingCeremony.generateAgentName('customer_support');
console.log(result.agentName); // "CustomerSupport_Ang"

// Validate
const validation = namingCeremony.validatePrefix('my_agent');
console.log(validation.valid); // true

// Get suggestions
const suggestions = namingCeremony.suggestPrefixes('sales');
console.log(suggestions); // ['SalesAssistant', 'LeadGenerator', ...]

// Generate certificate
const cert = namingCeremony.generateCertificate(result);
console.log(cert);
*/
