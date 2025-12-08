#!/usr/bin/env node

/**
 * Cloudflare AI Gateway Connection Test
 * This script verifies if your Cloudflare tools are properly configured
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔍 CLOUDFLARE AI GATEWAY CONNECTION TEST\n');
console.log('='.repeat(60));

// Check 1: .env file exists
console.log('\n✓ Checking .env file...');
const envPath = join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file NOT found');
  console.log('   Create one by copying .env.example:');
  console.log('   cp .env.example .env\n');
} else {
  console.log('✅ .env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Check API keys
  const hasGroqKey = envContent.includes('GROQ_API_KEY=') && !envContent.includes('GROQ_API_KEY=your_');
  const hasOpenRouterKey = envContent.includes('OPENROUTER_API_KEY=') && !envContent.includes('OPENROUTER_API_KEY=your_');
  const hasAIGateway = envContent.includes('AI_GATEWAY_URL=') && !envContent.includes('AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/YOUR_');
  
  console.log('\n📋 API Keys Configuration:');
  console.log('   GROQ_API_KEY:', hasGroqKey ? '✅ Configured' : '❌ Not configured');
  console.log('   OPENROUTER_API_KEY:', hasOpenRouterKey ? '✅ Configured' : '❌ Not configured');
  console.log('   AI_GATEWAY_URL:', hasAIGateway ? '✅ Configured' : '❌ Not configured');
}

// Check 2: Wrangler configuration
console.log('\n✓ Checking wrangler.toml...');
const wranglerPath = join(__dirname, 'wrangler.toml');
if (fs.existsSync(wranglerPath)) {
  console.log('✅ wrangler.toml exists');
  const wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');
  const hasD1Config = wranglerContent.includes('[[d1_databases]]');
  console.log('   D1 Database config:', hasD1Config ? '✅ Present' : '❌ Missing');
} else {
  console.log('❌ wrangler.toml NOT found');
}

// Check 3: Worker file
console.log('\n✓ Checking Cloudflare Worker...');
const workerPath = join(__dirname, 'workers', 'api.js');
if (fs.existsSync(workerPath)) {
  console.log('✅ workers/api.js exists');
  const workerContent = fs.readFileSync(workerPath, 'utf-8');
  const hasChatHandler = workerContent.includes('chatHandler');
  const hasAIGatewayURL = workerContent.includes('AI_GATEWAY_URL');
  console.log('   Chat handler:', hasChatHandler ? '✅ Present' : '❌ Missing');
  console.log('   AI Gateway integration:', hasAIGatewayURL ? '✅ Present' : '❌ Missing');
} else {
  console.log('❌ workers/api.js NOT found');
}

// Check 4: LLM module
console.log('\n✓ Checking LLM integration...');
const llmPath = join(__dirname, 'src', 'server', 'llm.js');
if (fs.existsSync(llmPath)) {
  console.log('✅ src/server/llm.js exists');
} else {
  console.log('❌ src/server/llm.js NOT found');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY:\n');

console.log('To enable Cloudflare AI Gateway, you need to:');
console.log('\n1️⃣  Configure API Keys:');
console.log('   • Get GROQ API key from https://console.groq.com');
console.log('   • Add to .env file');
console.log('\n2️⃣  Set up Cloudflare AI Gateway:');
console.log('   • Go to https://dash.cloudflare.com');
console.log('   • Navigate to AI > AI Gateway');
console.log('   • Create a new gateway');
console.log('   • Copy the gateway URL to .env');
console.log('\n3️⃣  Deploy Cloudflare Worker:');
console.log('   • Run: npm install -g wrangler');
console.log('   • Run: wrangler login');
console.log('   • Run: wrangler deploy');
console.log('\n4️⃣  Start local development:');
console.log('   • Run: wrangler dev (in one terminal)');
console.log('   • Run: npm run dev (in another terminal)');

console.log('\n' + '='.repeat(60));
console.log('\n');
