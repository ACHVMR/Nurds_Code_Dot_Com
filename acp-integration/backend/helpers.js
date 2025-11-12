/**
 * ACP Backend Helper Functions
 * Implements business logic for 4 primary intents
 */

import { ACPRouterInstance, ACPRouter, ACHEEVY, PickerAng, BuildsmithAng } from '../protocol/acp-router.ts';
import simpleGit from 'simple-git';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const git = simpleGit();

/**
 * Helper: Analyze competitors using ACHEEVY orchestrator
 */
export async function analyzeCompetitors(competitors) {
  console.log('[ACP Backend] Analyzing competitors:', competitors);
  
  const message = ACPRouter.createMessage(
    'backend',
    'ACHEEVY',
    'reimagine',
    { competitors, userIdea: 'marketplace' },
    crypto.randomUUID()
  );
  
  const result = await ACPRouterInstance.route(message);
  return result.analysis;
}

/**
 * Helper: Select patterns using PickerAng
 */
export async function selectPatterns(analysis) {
  console.log('[ACP Backend] Selecting patterns from analysis');
  
  const message = ACPRouter.createMessage(
    'backend',
    'PickerAng',
    'select-patterns',
    { competitors: analysis },
    crypto.randomUUID()
  );
  
  const result = await ACPRouterInstance.route(message);
  return result.patterns;
}

/**
 * Helper: Generate scaffold using BuildsmithAng
 */
export async function generateScaffold(patterns) {
  console.log('[ACP Backend] Generating scaffold from patterns:', patterns);
  
  const message = ACPRouter.createMessage(
    'backend',
    'BuildsmithAng',
    'generate-scaffold',
    { patterns },
    crypto.randomUUID()
  );
  
  const result = await ACPRouterInstance.route(message);
  return result.files;
}

/**
 * Helper: Deploy scaffold to Deploy Workbench
 */
export async function deployToWorkbench(scaffold) {
  console.log('[ACP Backend] Deploying scaffold to Workbench');
  
  // TODO: Integrate with Deploy Orchestrator API
  // For now, return mock workbench URL
  const workbenchUrl = `https://nurdscode.com/deploy/workbench?session=${crypto.randomUUID()}`;
  
  return workbenchUrl;
}

/**
 * Helper: Clone repository from various platforms
 */
export async function cloneRepository(url, platform) {
  console.log(`[ACP Backend] Cloning ${platform} repository:`, url);
  
  try {
    const repoName = url.split('/').pop().replace('.git', '');
    const targetDir = `./imported-repos/${repoName}`;
    
    await git.clone(url, targetDir);
    
    return {
      success: true,
      path: targetDir,
      name: repoName
    };
  } catch (error) {
    console.error('[ACP Backend] Clone failed:', error);
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

/**
 * Helper: Detect platform from repository URL
 */
export function detectPlatform(url) {
  if (url.includes('github.com')) return 'github';
  if (url.includes('gitlab.com')) return 'gitlab';
  if (url.includes('bitbucket.org')) return 'bitbucket';
  if (url.includes('huggingface.co')) return 'huggingface';
  return 'unknown';
}

/**
 * Helper: Run Playwright tests with 5 default scenarios
 */
export async function runPlaywrightTests(scenarios) {
  console.log('[ACP Backend] Running Playwright tests:', scenarios);
  
  const defaultScenarios = [
    'auth-flow',
    'create-project',
    'export-plug',
    'error-handling',
    'responsive-layout'
  ];
  
  const testsToRun = scenarios || defaultScenarios;
  
  try {
    const { stdout, stderr } = await execAsync(`npx playwright test ${testsToRun.join(' ')}`);
    
    return {
      success: true,
      output: stdout,
      scenarios: testsToRun
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      scenarios: testsToRun
    };
  }
}

/**
 * Helper: Boomer_Ang naming ceremony
 * Generates agent name following UserPrefixAng convention
 */
export function namingCeremony(prefix, role) {
  console.log('[ACP Backend] Naming ceremony for new agent');
  
  // Boomer_Ang naming convention: UserPrefixAng
  const agentName = `${prefix}Ang`;
  
  return {
    name: agentName,
    role: role,
    houseOf: 'ANG',
    tier: 'tier-6-orchestration',
    capabilities: [role],
    status: 'active'
  };
}

/**
 * Helper: Register new agent with Circuit Box
 */
export async function registerAgentInCircuitBox(agentConfig) {
  console.log('[ACP Backend] Registering agent in Circuit Box:', agentConfig.name);
  
  // TODO: Integrate with Circuit Box registry (breakers.yaml)
  // For now, return mock registration
  return {
    registered: true,
    tier: agentConfig.tier,
    name: agentConfig.name,
    timestamp: Date.now()
  };
}
