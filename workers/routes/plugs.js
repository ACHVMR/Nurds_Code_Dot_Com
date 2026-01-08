/**
 * ============================================
 * Hybrid Plug Deployment System
 * ============================================
 * 
 * Enables three deployment modes:
 * - Edge (Cloudflare Workers) - <100ms latency
 * - Cloud (GCP/AWS) - Full II-Agent access
 * - Self-Hosted (Customer K8s) - Full control
 * 
 * @version 2.0.0
 */

import { Router } from 'itty-router';
import { jsonResponse } from '../utils/responses.js';
import { badRequest, serverError } from '../utils/errors.js';

export const plugsRouter = Router({ base: '/api/v1/plugs' });

// ============================================
// PLUG REGISTRY & CONFIGURATION
// ============================================

const PLUG_TEMPLATES = {
  'code-review': {
    name: 'Code Review Assistant',
    description: 'AI-powered code review with security analysis',
    agents: ['codegen', 'validation', 'security'],
    defaultModel: 'claude-3.5-sonnet',
    estimatedLatency: '2-5s',
    estimatedCost: '$0.02-0.05',
    supportedModes: ['edge', 'cloud', 'hybrid', 'self-hosted'],
  },
  'research': {
    name: 'Research Agent',
    description: 'Web research and information synthesis',
    agents: ['research', 'synthesis'],
    defaultModel: 'gemini-2.0-pro',
    estimatedLatency: '5-15s',
    estimatedCost: '$0.03-0.10',
    supportedModes: ['cloud', 'hybrid'],
  },
  'codegen': {
    name: 'Code Generator',
    description: 'Generate production-ready code',
    agents: ['nlu', 'codegen', 'validation'],
    defaultModel: 'claude-3.5-sonnet',
    estimatedLatency: '3-8s',
    estimatedCost: '$0.02-0.08',
    supportedModes: ['edge', 'cloud', 'hybrid', 'self-hosted'],
  },
  'multimodal': {
    name: 'Multimodal Processor',
    description: 'Process images, audio, and mixed content',
    agents: ['multimodal', 'synthesis'],
    defaultModel: 'gemini-2.0-flash',
    estimatedLatency: '2-10s',
    estimatedCost: '$0.01-0.05',
    supportedModes: ['cloud', 'hybrid'],
  },
  'data-analyst': {
    name: 'Data Analyst',
    description: 'SQL generation and data analysis',
    agents: ['data', 'reasoning', 'synthesis'],
    defaultModel: 'gpt-4o',
    estimatedLatency: '3-10s',
    estimatedCost: '$0.03-0.10',
    supportedModes: ['cloud', 'hybrid', 'self-hosted'],
  },
};

// Deployment mode configurations
const DEPLOYMENT_MODES = {
  edge: {
    name: 'Edge Deployment',
    description: 'Deploy to Cloudflare global network for <100ms latency',
    provider: 'cloudflare',
    latency: '<100ms',
    baseCost: 4.99,
    perRequestCost: 0.00015, // $0.15/million
    features: ['low-latency', 'global-distribution', 'no-cold-start'],
  },
  cloud: {
    name: 'Cloud Deployment',
    description: 'Deploy to NURDS Cloud (GCP Cloud Run)',
    provider: 'gcp',
    latency: '1-3s',
    baseCost: 9.99,
    perRequestCost: 0.01,
    features: ['auto-scaling', 'full-agent-access', 'managed'],
  },
  hybrid: {
    name: 'Hybrid Deployment',
    description: 'Edge gateway + Cloud processing for your cloud account',
    provider: 'customer-cloud',
    latency: '0.5-2s',
    baseCost: 9.99,
    perRequestCost: 0.01,
    features: ['data-sovereignty', 'vpc-isolation', 'byoc'],
  },
  'self-hosted': {
    name: 'Self-Hosted Deployment',
    description: 'Deploy to your own Kubernetes cluster',
    provider: 'on-prem',
    latency: 'varies',
    baseCost: 0, // Enterprise license
    perRequestCost: 0,
    features: ['full-control', 'air-gapped', 'enterprise'],
  },
};

// ============================================
// PLUG ENDPOINTS
// ============================================

/**
 * GET /api/v1/plugs/templates - List available plug templates
 */
plugsRouter.get('/templates', async (request, env) => {
  return jsonResponse({
    templates: Object.entries(PLUG_TEMPLATES).map(([id, template]) => ({
      id,
      ...template,
    })),
    count: Object.keys(PLUG_TEMPLATES).length,
  });
});

/**
 * GET /api/v1/plugs/modes - List deployment modes
 */
plugsRouter.get('/modes', async (request, env) => {
  return jsonResponse({
    modes: DEPLOYMENT_MODES,
  });
});

/**
 * POST /api/v1/plugs/deploy - Deploy a plug
 */
plugsRouter.post('/deploy', async (request, env) => {
  try {
    const body = await request.json();
    const { templateId, mode = 'cloud', name, config = {} } = body;

    // Validate template
    const template = PLUG_TEMPLATES[templateId];
    if (!template) {
      return badRequest(`Unknown template: ${templateId}`);
    }

    // Validate mode
    if (!DEPLOYMENT_MODES[mode]) {
      return badRequest(`Unknown mode: ${mode}`);
    }

    if (!template.supportedModes.includes(mode)) {
      return badRequest(`Template ${templateId} doesn't support ${mode} mode`);
    }

    // Generate deployment configuration
    const deployment = await generateDeployment(templateId, mode, name, config, env);

    // Store deployment in D1
    const plugId = `plug_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    await env.DB.prepare(`
      INSERT INTO plug_deployments (id, template_id, name, mode, config, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).bind(plugId, templateId, name || template.name, mode, JSON.stringify(config)).run();

    return jsonResponse({
      plugId,
      template: templateId,
      mode,
      status: 'pending',
      deployment,
      estimatedCost: calculateEstimatedCost(mode, template),
      message: 'Deployment initiated. Check status with GET /api/v1/plugs/:id/status',
    });
  } catch (error) {
    console.error('[Plugs] Deploy error:', error);
    return serverError('Deployment failed: ' + error.message);
  }
});

/**
 * POST /api/v1/plugs/:id/execute - Execute a plug
 */
plugsRouter.post('/:id/execute', async (request, env) => {
  try {
    const plugId = request.params.id;
    const body = await request.json();
    const { input, context = {}, options = {} } = body;

    // Get plug configuration
    const plug = await env.DB.prepare(`
      SELECT * FROM plug_deployments WHERE id = ?
    `).bind(plugId).first();

    if (!plug) {
      return badRequest(`Plug not found: ${plugId}`);
    }

    const template = PLUG_TEMPLATES[plug.template_id];
    const mode = plug.mode;

    // Classify complexity for routing
    const complexity = classifyComplexity(input);

    // Route based on mode and complexity
    let result;
    const startTime = Date.now();

    if (mode === 'edge' && complexity === 'simple') {
      // Execute on edge
      result = await executeOnEdge(input, template, env);
    } else if (mode === 'cloud' || mode === 'hybrid') {
      // Route to ACHEEVY Hub
      result = await executeOnCloud(input, template, context, env);
    } else {
      // Self-hosted - return execution instructions
      result = {
        status: 'self-hosted',
        instructions: 'Execute locally using provided Helm chart',
        agents: template.agents,
      };
    }

    const latency = Date.now() - startTime;

    // Log execution
    await env.DB.prepare(`
      INSERT INTO plug_executions (plug_id, input_size, latency_ms, status, created_at)
      VALUES (?, ?, ?, 'completed', datetime('now'))
    `).bind(plugId, JSON.stringify(input).length, latency).run();

    return jsonResponse({
      plugId,
      result,
      metadata: {
        latency,
        mode,
        complexity,
        agents: template.agents,
        model: template.defaultModel,
      },
    });
  } catch (error) {
    console.error('[Plugs] Execute error:', error);
    return serverError('Execution failed: ' + error.message);
  }
});

/**
 * GET /api/v1/plugs/:id/status - Get plug status
 */
plugsRouter.get('/:id/status', async (request, env) => {
  try {
    const plugId = request.params.id;

    const plug = await env.DB.prepare(`
      SELECT * FROM plug_deployments WHERE id = ?
    `).bind(plugId).first();

    if (!plug) {
      return badRequest(`Plug not found: ${plugId}`);
    }

    // Get execution stats
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_executions,
        AVG(latency_ms) as avg_latency,
        SUM(input_size) as total_bytes
      FROM plug_executions WHERE plug_id = ?
    `).bind(plugId).first();

    return jsonResponse({
      plug: {
        id: plug.id,
        name: plug.name,
        template: plug.template_id,
        mode: plug.mode,
        status: plug.status,
        createdAt: plug.created_at,
      },
      stats: {
        totalExecutions: stats?.total_executions || 0,
        avgLatency: Math.round(stats?.avg_latency || 0),
        totalBytesProcessed: stats?.total_bytes || 0,
      },
    });
  } catch (error) {
    console.error('[Plugs] Status error:', error);
    return serverError('Status check failed: ' + error.message);
  }
});

/**
 * POST /api/v1/plugs/generate-terraform - Generate Terraform for hybrid/self-hosted
 */
plugsRouter.post('/generate-terraform', async (request, env) => {
  try {
    const body = await request.json();
    const { templateId, provider = 'aws', region = 'us-east-1', config = {} } = body;

    const template = PLUG_TEMPLATES[templateId];
    if (!template) {
      return badRequest(`Unknown template: ${templateId}`);
    }

    const terraform = generateTerraformConfig(templateId, template, provider, region, config);

    return jsonResponse({
      provider,
      region,
      terraform,
      instructions: [
        '1. Save the terraform config to a file (e.g., main.tf)',
        '2. Run: terraform init',
        '3. Run: terraform plan',
        '4. Run: terraform apply',
        '5. Configure your plug with the output URLs',
      ],
    });
  } catch (error) {
    console.error('[Plugs] Terraform error:', error);
    return serverError('Terraform generation failed: ' + error.message);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Classify input complexity for routing
 */
function classifyComplexity(input) {
  const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
  const length = inputStr.length;
  
  if (length < 1000) return 'simple';
  if (length < 10000) return 'moderate';
  return 'complex';
}

/**
 * Generate deployment configuration
 */
async function generateDeployment(templateId, mode, name, config, env) {
  const template = PLUG_TEMPLATES[templateId];
  
  const deployment = {
    template: templateId,
    mode,
    name: name || template.name,
    agents: template.agents,
    model: config.model || template.defaultModel,
  };

  if (mode === 'edge') {
    deployment.cloudflare = {
      workerName: `plug-${templateId}-${Date.now()}`,
      routes: [`*.${templateId}.nurds.code/*`],
      kv: true,
    };
  } else if (mode === 'cloud') {
    deployment.cloudRun = {
      service: `plug-${templateId}`,
      region: config.region || 'us-central1',
      minInstances: 1,
      maxInstances: 10,
    };
  } else if (mode === 'hybrid') {
    deployment.hybrid = {
      gateway: 'cloudflare',
      backend: config.provider || 'aws',
      vpcPeering: true,
    };
  } else if (mode === 'self-hosted') {
    deployment.helm = {
      chart: 'nurds-plug',
      version: '2.0.0',
      values: {
        replicas: config.replicas || 2,
        resources: config.resources || { cpu: '1', memory: '2Gi' },
      },
    };
  }

  return deployment;
}

/**
 * Calculate estimated cost
 */
function calculateEstimatedCost(mode, template) {
  const modeConfig = DEPLOYMENT_MODES[mode];
  const avgRequests = 10000; // Estimate 10K requests/month
  
  return {
    base: modeConfig.baseCost,
    perRequest: modeConfig.perRequestCost,
    estimated10K: modeConfig.baseCost + (avgRequests * modeConfig.perRequestCost),
    currency: 'USD',
  };
}

/**
 * Execute on edge (Cloudflare Workers)
 */
async function executeOnEdge(input, template, env) {
  // Simple edge execution using Cloudflare AI
  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: `You are a ${template.name}. Process the user's request concisely.` },
      { role: 'user', content: typeof input === 'string' ? input : JSON.stringify(input) },
    ],
    max_tokens: 1024,
  });

  return {
    output: result.response,
    executedOn: 'edge',
    model: '@cf/meta/llama-3.1-8b-instruct',
  };
}

/**
 * Execute on cloud (ACHEEVY Hub)
 */
async function executeOnCloud(input, template, context, env) {
  const hubUrl = env.ACHEEVY_HUB_URL || 'https://acheevy-hub-xxxxx.run.app';
  
  // If no hub configured, simulate locally
  if (!hubUrl || hubUrl.includes('xxxxx')) {
    return {
      output: 'Cloud execution simulated (ACHEEVY Hub not configured)',
      agents: template.agents,
      model: template.defaultModel,
      executedOn: 'cloud-simulated',
    };
  }

  const response = await fetch(`${hubUrl}/api/v1/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agents: template.agents,
      input,
      context,
      model: template.defaultModel,
    }),
  });

  return response.json();
}

/**
 * Generate Terraform configuration
 */
function generateTerraformConfig(templateId, template, provider, region, config) {
  if (provider === 'aws') {
    return `
# NURDS Plug: ${template.name}
# Provider: AWS
# Region: ${region}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# ECS Cluster for II-Agents
resource "aws_ecs_cluster" "nurds_plug" {
  name = "nurds-plug-${templateId}"
}

# Task Definition for each agent
${template.agents.map(agent => `
resource "aws_ecs_task_definition" "${agent}" {
  family                   = "ii-${agent}-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = ${config.cpu || 256}
  memory                  = ${config.memory || 512}
  execution_role_arn      = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([{
    name  = "ii-${agent}-worker"
    image = "ghcr.io/nurds-code/ii-${agent}-worker:latest"
    portMappings = [{
      containerPort = 8080
      protocol      = "tcp"
    }]
    environment = [
      { name = "AGENT_TYPE", value = "${agent}" },
      { name = "NODE_ENV", value = "production" }
    ]
  }])
}`).join('\n')}

# IAM Role for ECS
resource "aws_iam_role" "ecs_execution" {
  name = "nurds-plug-ecs-execution"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

output "cluster_name" {
  value = aws_ecs_cluster.nurds_plug.name
}
`;
  }

  // Default to GCP
  return `
# NURDS Plug: ${template.name}
# Provider: GCP
# Region: ${region}

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  region = "${region}"
}

# Cloud Run services for each agent
${template.agents.map(agent => `
resource "google_cloud_run_service" "ii_${agent}" {
  name     = "ii-${agent}-worker"
  location = "${region}"

  template {
    spec {
      containers {
        image = "gcr.io/nurds-code/ii-${agent}-worker:latest"
        env {
          name  = "AGENT_TYPE"
          value = "${agent}"
        }
      }
    }
  }
}`).join('\n')}
`;
}

export default plugsRouter;
