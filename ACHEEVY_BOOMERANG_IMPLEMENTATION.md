# ACHEEVY Boomer_Ang Implementation Plan
**NURDScode AI Model API Guide | November 2, 2025**

> **Tagline:** Think It. Prompt It. Let's Build It.

**Purpose:** Implementable research for the NURDScode platform—powering ACHEEVY's orchestration across IIAgent-17 repositories via the Cloudflare VibeCoding SDK.

---

## 1. Agent Classification System

### Boomer_Angs (Commons) - User-Created AI Agents
All user-created agents are branded as **Boomer_Angs** (plural) or **Boomer_Ang** (singular). These are the Commons—community-driven, voice-powered, task-management agents.

**Categories:**
- **Code Boomer_Angs** - Software development agents
- **Task Boomer_Angs** - Workflow automation agents
- **Data Boomer_Angs** - Data processing agents
- **Research Boomer_Angs** - Information gathering agents
- **Creative Boomer_Angs** - Content generation agents

### II-Agent Modules - Platform Orchestration (17 Repos)
The 17 II-Agent modules provide the **infrastructure** that powers Boomer_Angs:

**Core Orchestrator (1):**
- `ii-agent-core` → Powers ACHEEVY orchestration engine

**Orchestration Layer (4):**
- `ii-agent-registry` → Manages Boomer_Ang discovery
- `ii-task-queue` → Schedules Boomer_Ang tasks
- `ii-state-manager` → Maintains Boomer_Ang context
- `ii-event-bus` → Enables Boomer_Ang communication

**Code Intelligence (4):**
- `ii-code-analyzer` → Analyzes code for Code Boomer_Angs
- `ii-code-generator` → Generates code for Code Boomer_Angs
- `ii-code-refactor` → Refactors code for Code Boomer_Angs
- `ii-dependency-resolver` → Resolves dependencies for Code Boomer_Angs

**Task Automation (4):**
- `ii-workflow-engine` → Powers Task Boomer_Angs
- `ii-deployment-agent` → Deploys Boomer_Ang outputs
- `ii-testing-agent` → Tests Boomer_Ang code
- `ii-monitoring-agent` → Monitors Boomer_Ang health

**Data & Integration (4):**
- `ii-data-pipeline` → Processes data for Data Boomer_Angs
- `ii-api-gateway` → Routes Boomer_Ang API calls
- `ii-webhook-handler` → Handles Boomer_Ang webhooks
- `ii-plugin-system` → Extends Boomer_Ang capabilities

**Browser & Research (1):**
- `ii-browser-automation` → Powers Research Boomer_Angs

---

## 2. Voice Integration Architecture

### Voice-First User Experience
**Nextel-Style Console** - Floating, persistent on all pages:
- **Chirp on send/receive** - Audio feedback for actions
- **Chat bubbles branded** - NURDScode visual identity
- **ACHEEVY persona nameplate** - Clear agent identification
- **Voice commands** → Actions (super-powered)

### Voice Capabilities (Groq ASR/TTS)
```javascript
// Voice Integration via Groq
const voiceConfig = {
  asr: {
    model: 'whisper-large-v3',
    pricing: '$0.04-$0.111 per transcribed hour',
    minBilling: '10 seconds per request',
    languages: ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko']
  },
  tts: {
    model: 'PlayAI Dialog',
    pricing: '$50 per 1M characters',
    voices: ['ACHEEVY', 'Boomer_Ang_Male', 'Boomer_Ang_Female']
  }
};
```

### Voice-Powered Actions
Users can voice command Boomer_Angs:
- **"Create a Code Boomer_Ang for React components"**
- **"Deploy my Task Boomer_Ang to production"**
- **"Show me Data Boomer_Ang analytics"**
- **"Start Research Boomer_Ang on blockchain trends"**

---

## 3. Model Routing & Pricing Engine

### Primary Model Routing Order
**Groq → OpenRouter → DeepSeek → Other APIs → Rising Models**

### 3.1 Groq (Primary - Low Latency)
**Why:** Deterministic, high TPS, linear per-token pricing, no subscription.

**Model Selection for Boomer_Angs:**

| Model | Input/1M | Output/1M | Best For | Boomer_Ang Type |
|-------|----------|-----------|----------|-----------------|
| **GPT-OSS 20B** (128k) | $0.075 | $0.30 | Ultra-cheap bulk | All types |
| **GPT-OSS 120B** (128k) | $0.15 | $0.60 | Complex reasoning | Code/Research |
| **Llama 4 Scout** (MoE 17B×16E, 128k) | $0.11 | $0.34 | General coding | Code Boomer_Angs |
| **Llama 4 Maverick** (MoE 17B×128E, 128k) | $0.20 | $0.60 | Advanced tasks | Task Boomer_Angs |
| **Qwen3 32B** (131k) | $0.29 | $0.59 | Multilingual | All types |
| **Llama 3.3 70B** (128k) | $0.59 | $0.79 | High-quality output | Creative Boomer_Angs |
| **Llama 3.1 8B** (128k) | $0.05 | $0.08 | Speed tests | Task Boomer_Angs |
| **Kimi K2-0905** (1T, 256k) | $1.00 | $3.00 | Massive context | Data Boomer_Angs |

**Routing Rules for Boomer_Angs:**
```javascript
function routeBoomerAngModel(boomerAng) {
  const { type, taskComplexity, budget, contextSize } = boomerAng;
  
  // Default routing
  if (type === 'code' && budget === 'low') return 'llama-4-scout-128k';
  if (type === 'code' && taskComplexity === 'high') return 'gpt-oss-120b-128k';
  if (type === 'task' && contextSize < 8000) return 'llama-3.1-8b-128k';
  if (type === 'data' && contextSize > 100000) return 'kimi-k2-0905-256k';
  if (type === 'research' && budget === 'medium') return 'qwen3-32b-131k';
  if (type === 'creative') return 'llama-3.3-70b-128k';
  
  // Default to Scout for all else
  return 'llama-4-scout-128k';
}
```

### 3.2 OpenRouter (Secondary - Model Diversity)
**Why:** 300-500+ models, single API, BYOK support, 1M free requests/month.

**Pricing:** Pass-through rates + 5.5% fee on credit purchases (min $0.80).

**Key Models for Boomer_Angs:**
- **Mistral Large 2:** ~$2.00 in / $6.00 out - Research/Creative Boomer_Angs
- **GPT-4 Turbo:** ~$10.00 in / $30.00 out - Premium Code Boomer_Angs
- **o3-pro:** $20/$80 per 1M - Advanced reasoning for Task Boomer_Angs
- **o1-pro:** $150/$600 per 1M - Enterprise-grade for all types

**BYOK Integration:**
```javascript
// OpenRouter BYOK for Teams
if (user.team && user.team.byok.openrouter) {
  // First 1M requests free, then 5% fee
  return {
    provider: 'openrouter',
    key: user.team.byok.openrouter,
    freeRequests: 1000000,
    feeRate: 0.05
  };
}
```

### 3.3 DeepSeek (OCR + Reasoning)
**Why:** 10× compression for docs, ~97% OCR precision, self-host option.

**Use Cases for Boomer_Angs:**
- **Data Boomer_Angs:** Process PDFs, scanned documents
- **Research Boomer_Angs:** Extract text from images/papers
- **Code Boomer_Angs:** Read documentation screenshots

**DeepSeek-OCR Modes:**
```javascript
const deepSeekOCR = {
  tiny: { vTokens: 64, speed: 'fastest', precision: 0.90 },
  small: { vTokens: 100, speed: 'fast', precision: 0.95 },
  medium: { vTokens: 200, speed: 'balanced', precision: 0.97 },
  large: { vTokens: 400, speed: 'accurate', precision: 0.99 }
};

// Compression savings
function calculateOCRSavings(pages, textTokensPerPage) {
  const withoutOCR = pages * textTokensPerPage;
  const withOCR = pages * 100; // small mode avg
  const compression = withoutOCR / withOCR;
  return { compression, saved: withoutOCR - withOCR };
}
```

### 3.4 Rising Models Rail
**Auto-populated from Groq/OpenRouter feeds:**
- DeepSeek R1/V3/Code variants
- Mistral Large 2
- New Gemini Flash/Pro previews (1M context)
- Open models on Groq (GPT-OSS)

**UI Component:**
```jsx
<div className="rising-models-rail">
  <h3>🚀 Rising Models for Your Boomer_Ang</h3>
  {risingModels.map(model => (
    <ModelCard 
      key={model.id}
      name={model.name}
      sweetSpot={model.sweetSpot}
      savings={calculateSavings(model)}
      onSelect={() => recalcQuote(model)}
    />
  ))}
</div>
```

---

## 4. Tier Breakdown & Pricing

### 5 Tiers: Buy-Me-A-Coffee → Light → Medium → Heavy → Superior

#### Buy-Me-A-Coffee (Free Tier)
**Target:** Hobbyists, students, single Boomer_Angs
- **Monthly Credits:** $5 equivalent
- **Boomer_Angs Limit:** 3 active
- **Models:** Llama 3.1 8B, GPT-OSS 20B only
- **Voice:** 1 hour ASR/month, 10K TTS chars
- **Storage:** 100 MB
- **Priority:** Low queue priority
- **Features:** Community support, basic analytics

#### Light ($10/month)
**Target:** Freelancers, small projects, 5-10 Boomer_Angs
- **Monthly Credits:** $30 equivalent (3× value)
- **Boomer_Angs Limit:** 10 active
- **Models:** All Groq models, OpenRouter free tier
- **Voice:** 10 hours ASR/month, 100K TTS chars
- **Storage:** 1 GB
- **Priority:** Standard queue
- **Features:** Email support, usage analytics, team sharing (3 members)

#### Medium ($50/month)
**Target:** Small teams, 20-50 Boomer_Angs
- **Monthly Credits:** $200 equivalent (4× value)
- **Boomer_Angs Limit:** 50 active
- **Models:** All Groq + OpenRouter catalog + DeepSeek OCR
- **Voice:** 50 hours ASR/month, 500K TTS chars
- **Storage:** 10 GB
- **Priority:** High queue priority
- **Features:** Priority support, advanced analytics, team sharing (10 members), BYOK support

#### Heavy ($200/month)
**Target:** Agencies, enterprise teams, unlimited Boomer_Angs
- **Monthly Credits:** $1000 equivalent (5× value)
- **Boomer_Angs Limit:** Unlimited
- **Models:** Full catalog + premium models (GPT-4 Turbo, o1)
- **Voice:** 200 hours ASR/month, 2M TTS chars
- **Storage:** 100 GB
- **Priority:** Enterprise priority
- **Features:** 24/7 support, custom analytics, team sharing (50 members), BYOK, SLA 99.9%

#### Superior (Custom/Enterprise)
**Target:** Large enterprises, white-label, dedicated infrastructure
- **Monthly Credits:** Custom
- **Boomer_Angs Limit:** Unlimited
- **Models:** Full catalog + dedicated deployments
- **Voice:** Unlimited ASR/TTS
- **Storage:** Unlimited
- **Priority:** Dedicated resources
- **Features:** Dedicated account manager, custom integrations, white-label, SLA 99.99%, on-premise option

---

## 5. Cost Estimator Implementation

### Quote Engine (Pre-Run)
```javascript
class BoomerAngQuoteEngine {
  constructor(rateStore, tierConfig) {
    this.rates = rateStore; // Daily refresh from Groq/OpenRouter
    this.tiers = tierConfig;
  }

  async quote(task, boomerAng, user) {
    // 1. Route model
    const model = this.routeModel(task, boomerAng, user.tier);
    
    // 2. Estimate tokens
    const { inputTokens, outputTokens } = this.estimateTokens(task);
    
    // 3. Check OCR pre-processing
    let baseCost;
    if (task.hasDocuments && this.shouldUseOCR(task, user.tier)) {
      const ocrCost = this.calculateOCRCost(task.documents);
      const reducedTokens = this.applyOCRCompression(inputTokens);
      baseCost = ocrCost + this.calculateLLMCost(model, reducedTokens, outputTokens);
    } else {
      baseCost = this.calculateLLMCost(model, inputTokens, outputTokens);
    }
    
    // 4. Apply tier adjustments
    const tierMultiplier = this.tiers[user.tier].creditMultiplier;
    const effectiveCost = baseCost / tierMultiplier;
    
    // 5. Add voice costs if applicable
    if (task.voiceInput) {
      effectiveCost += this.calculateASRCost(task.voiceDuration);
    }
    if (task.voiceOutput) {
      effectiveCost += this.calculateTTSCost(task.outputLength);
    }
    
    return {
      model: model.name,
      inputTokens,
      outputTokens,
      baseCost,
      effectiveCost,
      savings: baseCost - effectiveCost,
      tierMultiplier,
      breakdown: {
        llm: this.calculateLLMCost(model, inputTokens, outputTokens),
        ocr: task.hasDocuments ? this.calculateOCRCost(task.documents) : 0,
        asr: task.voiceInput ? this.calculateASRCost(task.voiceDuration) : 0,
        tts: task.voiceOutput ? this.calculateTTSCost(task.outputLength) : 0
      }
    };
  }

  calculateLLMCost(model, inputTokens, outputTokens) {
    const rateIn = this.rates[model.id].input / 1000000;
    const rateOut = this.rates[model.id].output / 1000000;
    return (inputTokens * rateIn) + (outputTokens * rateOut);
  }

  calculateOCRCost(documents) {
    // Self-hosted: compute-only (GPU time)
    if (this.hasGPU()) {
      const pages = documents.reduce((sum, doc) => sum + doc.pages, 0);
      const gpuMinutes = pages / 100; // ~100 pages/minute on A100
      return gpuMinutes * (this.gpuHourlyRate / 60);
    }
    // Hosted: vision tokens
    const visionTokens = documents.reduce((sum, doc) => 
      sum + (doc.pages * 100), 0); // small mode
    return visionTokens * this.rates['vision-token'].price;
  }

  calculateASRCost(durationSeconds) {
    const hours = Math.max(durationSeconds / 3600, 10 / 3600); // 10s minimum
    return hours * 0.111; // Max rate
  }

  calculateTTSCost(characters) {
    return (characters / 1000000) * 50;
  }

  routeModel(task, boomerAng, tier) {
    // Tier restrictions
    if (tier === 'buy-me-a-coffee') {
      return this.rates['llama-3.1-8b-128k'];
    }
    
    // Use routing logic
    const modelId = routeBoomerAngModel({
      type: boomerAng.type,
      taskComplexity: task.complexity,
      budget: this.tiers[tier].budget,
      contextSize: task.estimatedTokens
    });
    
    return this.rates[modelId];
  }
}
```

### Rate Store (Daily Refresh)
```javascript
class RateStore {
  constructor() {
    this.rates = {};
    this.lastUpdate = null;
  }

  async refresh() {
    // Groq rates
    const groqRates = await fetch('https://api.groq.com/openai/v1/models');
    this.rates = this.parseGroqRates(groqRates);
    
    // OpenRouter rates
    const orRates = await fetch('https://openrouter.ai/api/v1/models');
    this.rates = { ...this.rates, ...this.parseORRates(orRates) };
    
    // DeepSeek (self-hosted config)
    this.rates['deepseek-ocr'] = {
      gpuHourly: parseFloat(process.env.GPU_HOURLY_RATE || '1.50'),
      pagesPerMinute: 100
    };
    
    this.lastUpdate = new Date();
    await this.saveToKV(); // Cloudflare KV
  }

  async init() {
    const cached = await this.loadFromKV();
    if (cached && this.isFresh(cached.lastUpdate)) {
      this.rates = cached.rates;
      this.lastUpdate = new Date(cached.lastUpdate);
    } else {
      await this.refresh();
    }
  }

  isFresh(lastUpdate) {
    const age = Date.now() - new Date(lastUpdate).getTime();
    return age < 24 * 60 * 60 * 1000; // 24 hours
  }
}
```

---

## 6. Boomer_Ang Creation UX

### Agent Builder Flow
```jsx
// src/pages/BoomerAngBuilder.jsx
export default function BoomerAngBuilder() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    name: '',
    type: '', // code, task, data, research, creative
    voiceEnabled: true,
    personality: 'professional',
    models: [],
    triggers: []
  });

  return (
    <div className="boomer-ang-builder">
      <h1>Create Your Boomer_Ang</h1>
      
      {step === 1 && (
        <TypeSelector 
          value={config.type}
          onChange={(type) => setConfig({...config, type})}
          options={[
            { 
              value: 'code', 
              label: 'Code Boomer_Ang',
              icon: <Code />,
              description: 'Builds software, analyzes code, generates components',
              models: ['llama-4-scout', 'gpt-oss-120b']
            },
            { 
              value: 'task', 
              label: 'Task Boomer_Ang',
              icon: <CheckSquare />,
              description: 'Automates workflows, manages processes',
              models: ['llama-4-maverick', 'qwen3-32b']
            },
            { 
              value: 'data', 
              label: 'Data Boomer_Ang',
              icon: <Database />,
              description: 'Processes data, runs analytics, generates reports',
              models: ['kimi-k2-0905', 'llama-3.3-70b']
            },
            { 
              value: 'research', 
              label: 'Research Boomer_Ang',
              icon: <Search />,
              description: 'Gathers information, analyzes trends, summarizes',
              models: ['qwen3-32b', 'gpt-oss-120b']
            },
            { 
              value: 'creative', 
              label: 'Creative Boomer_Ang',
              icon: <Sparkles />,
              description: 'Writes content, designs, generates ideas',
              models: ['llama-3.3-70b', 'mistral-large-2']
            }
          ]}
        />
      )}
      
      {step === 2 && (
        <VoiceConfiguration 
          enabled={config.voiceEnabled}
          onToggle={(enabled) => setConfig({...config, voiceEnabled: enabled})}
          personality={config.personality}
          onPersonalityChange={(p) => setConfig({...config, personality: p})}
          previewVoice={(text) => playTTS(text, config.personality)}
        />
      )}
      
      {step === 3 && (
        <ModelSelection 
          type={config.type}
          tier={user.tier}
          selected={config.models}
          onChange={(models) => setConfig({...config, models})}
          showRisingModels={true}
        />
      )}
      
      {step === 4 && (
        <TriggerConfiguration 
          triggers={config.triggers}
          onChange={(triggers) => setConfig({...config, triggers})}
          options={[
            { type: 'voice_command', label: 'Voice Command' },
            { type: 'webhook', label: 'Webhook' },
            { type: 'schedule', label: 'Schedule' },
            { type: 'file_upload', label: 'File Upload' },
            { type: 'api_call', label: 'API Call' }
          ]}
        />
      )}
      
      {step === 5 && (
        <QuotePreview 
          config={config}
          onDeploy={deployBoomerAng}
        />
      )}
    </div>
  );
}
```

---

## 7. Nextel Console Implementation

### Floating Voice Console
```jsx
// src/components/NextelConsole.jsx
export default function NextelConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeBoomerAng, setActiveBoomerAng] = useState(null);

  const startListening = async () => {
    setIsListening(true);
    playChirp('start');
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      const transcript = await transcribeAudio(audioBlob);
      handleVoiceCommand(transcript);
      playChirp('end');
      setIsListening(false);
    };
    
    recorder.start();
    setTimeout(() => recorder.stop(), 5000); // 5s max
  };

  const handleVoiceCommand = async (command) => {
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: command, 
      timestamp: Date.now(),
      mode: 'voice'
    }]);
    
    // Route to appropriate Boomer_Ang
    const boomerAng = await routeCommand(command);
    setActiveBoomerAng(boomerAng);
    
    // Execute via II-Agent
    const response = await executeBoomerAngCommand(boomerAng, command);
    
    setMessages(prev => [...prev, { 
      type: 'boomer_ang', 
      boomerAng: boomerAng.name,
      content: response.text,
      cost: response.cost,
      model: response.model,
      tokens: response.tokens,
      timestamp: Date.now()
    }]);
    
    // TTS response if enabled
    if (boomerAng.voiceEnabled) {
      await speakResponse(response.text, boomerAng.personality);
    }
  };

  return (
    <div className={`nextel-console ${isOpen ? 'open' : 'minimized'}`}>
      <div className="console-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="acheevy-avatar">
          <img src="/acheevy-logo.svg" alt="ACHEEVY" />
        </div>
        <span className="console-title">ACHEEVY Console</span>
        {activeBoomerAng && (
          <span className="active-agent">{activeBoomerAng.name}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="console-body">
          <div className="messages-container">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
          </div>
          
          <div className="console-controls">
            <button 
              className={`voice-button ${isListening ? 'listening' : ''}`}
              onClick={startListening}
            >
              <Mic />
              {isListening ? 'Listening...' : 'Voice Command'}
            </button>
            
            <input 
              type="text"
              placeholder="Type to your Boomer_Ang..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleVoiceCommand(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
          
          <div className="quick-actions">
            <button onClick={() => handleVoiceCommand('Create Code Boomer_Ang')}>
              + Code Agent
            </button>
            <button onClick={() => handleVoiceCommand('Show my Boomer_Angs')}>
              My Agents
            </button>
            <button onClick={() => handleVoiceCommand('Deploy latest')}>
              Deploy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }) {
  return (
    <div className={`message-bubble ${message.type}`}>
      {message.type === 'boomer_ang' && (
        <div className="message-header">
          <span className="boomer-ang-name">{message.boomerAng}</span>
          <span className="message-meta">
            {message.model} • {message.tokens.input}→{message.tokens.output} tokens • ${message.cost.toFixed(4)}
          </span>
        </div>
      )}
      <div className="message-content">{message.content}</div>
      {message.mode === 'voice' && <VoiceIndicator />}
    </div>
  );
}
```

---

## 8. II-Agent ↔ Boomer_Ang Mapping

### Execution Graph
```
User Voice Command
    ↓
ACHEEVY Console (Intent Parse)
    ↓
Boomer_Ang Selection (Type-based routing)
    ↓
II-Agent Module Dispatch
    ↓
Model Router (Groq → OpenRouter → DeepSeek)
    ↓
Quote Engine (Pre-execution cost estimate)
    ↓
[User Approval]
    ↓
Execution (Streamed output)
    ↓
Usage Ledger Update
    ↓
TTS Response (if voice-enabled)
```

### Module Mapping Table

| Boomer_Ang Action | II-Agent Module | Model Default | Voice Integration |
|-------------------|-----------------|---------------|-------------------|
| "Create React component" | ii-code-generator | llama-4-scout | ASR→LLM→TTS |
| "Analyze this codebase" | ii-code-analyzer | gpt-oss-120b | ASR→LLM→TTS |
| "Refactor for performance" | ii-code-refactor | llama-4-scout | ASR→LLM→TTS |
| "Deploy to Cloudflare" | ii-deployment-agent | llama-3.1-8b | ASR→LLM |
| "Run tests" | ii-testing-agent | llama-3.1-8b | ASR→LLM→TTS |
| "Process this PDF" | ii-data-pipeline + DeepSeek-OCR | deepseek+qwen3 | ASR→OCR→LLM→TTS |
| "Research blockchain trends" | ii-browser-automation | qwen3-32b | ASR→LLM→TTS |
| "Write blog post" | ii-code-generator (creative) | llama-3.3-70b | ASR→LLM→TTS |
| "Schedule daily report" | ii-workflow-engine | llama-4-maverick | ASR→LLM→TTS |
| "Monitor agent health" | ii-monitoring-agent | llama-3.1-8b | LLM→TTS (alerts) |

---

## 9. Database Schema Extensions

### Boomer_Angs Table
```sql
CREATE TABLE boomer_angs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('code', 'task', 'data', 'research', 'creative')),
    voice_enabled BOOLEAN DEFAULT true,
    voice_personality TEXT DEFAULT 'professional', -- professional, friendly, casual, formal
    models JSONB DEFAULT '[]'::jsonb, -- Array of preferred models
    triggers JSONB DEFAULT '[]'::jsonb, -- Voice commands, webhooks, schedules
    ii_agent_modules TEXT[] DEFAULT '{}', -- Which II-Agent modules this uses
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    usage_stats JSONB DEFAULT '{}'::jsonb, -- tokens, costs, runs
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_boomer_angs_user ON boomer_angs(user_id);
CREATE INDEX idx_boomer_angs_type ON boomer_angs(type);
CREATE INDEX idx_boomer_angs_status ON boomer_angs(status);
```

### Usage Ledger Table
```sql
CREATE TABLE usage_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    boomer_ang_id UUID REFERENCES boomer_angs(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    cost_base DECIMAL(10, 6) NOT NULL,
    cost_effective DECIMAL(10, 6) NOT NULL, -- After tier multiplier
    tier TEXT NOT NULL,
    voice_asr_seconds INTEGER DEFAULT 0,
    voice_tts_chars INTEGER DEFAULT 0,
    ocr_pages INTEGER DEFAULT 0,
    ii_agent_module TEXT, -- Which module executed
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_ledger_user ON usage_ledger(user_id, created_at DESC);
CREATE INDEX idx_usage_ledger_boomer_ang ON usage_ledger(boomer_ang_id, created_at DESC);
```

### Tier Credits Table
```sql
CREATE TABLE tier_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    tier TEXT NOT NULL,
    credits_monthly DECIMAL(10, 2) NOT NULL,
    credits_remaining DECIMAL(10, 2) NOT NULL,
    credits_used DECIMAL(10, 2) NOT NULL DEFAULT 0,
    reset_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tier_credits_user ON tier_credits(user_id);
```

---

## 10. Implementation Checklist

### Phase 1: Infrastructure (Week 1)
- [ ] Wire RateStore with daily cron (Groq + OpenRouter APIs)
- [ ] Implement Model Router with tier-based restrictions
- [ ] Create BoomerAngQuoteEngine with voice/OCR cost calculation
- [ ] Deploy DeepSeek-OCR pre-processor (self-hosted Docker container)
- [ ] Add tier-aware credit system to database

### Phase 2: Boomer_Ang System (Week 2-3)
- [ ] Build BoomerAngBuilder UI with 5-step wizard
- [ ] Implement voice configuration with personality selection
- [ ] Create model selection UI with Rising Models rail
- [ ] Build trigger configuration (voice commands, webhooks, schedules)
- [ ] Wire Boomer_Ang creation to II-Agent module mapping

### Phase 3: Voice Integration (Week 4)
- [ ] Implement Nextel Console (floating, collapsible)
- [ ] Integrate Groq Whisper ASR with 10s minimum billing
- [ ] Integrate PlayAI TTS with personality voices
- [ ] Add chirp sound effects (send/receive)
- [ ] Build voice command routing to Boomer_Angs

### Phase 4: Execution Engine (Week 5-6)
- [ ] Wire II-Agent modules to Boomer_Ang actions (table above)
- [ ] Implement streaming execution with live token counting
- [ ] Build UsageLedger with real-time cost tracking
- [ ] Add quota enforcement per tier
- [ ] Create cost breakdown UI (model, tokens, $, ETA)

### Phase 5: UX Polish (Week 7)
- [ ] Design NURDScode-branded chat bubbles
- [ ] Add ACHEEVY persona nameplate animations
- [ ] Build cost clarity badges (inline estimates)
- [ ] Create /docs/models-pricing auto-refresh page
- [ ] Implement mobile-responsive Nextel Console

### Phase 6: Advanced Features (Week 8+)
- [ ] BYOK support for OpenRouter (team feature)
- [ ] Batch API integration for Groq (bulk tasks)
- [ ] Secondary Selector for Rising Models
- [ ] Custom Boomer_Ang templates
- [ ] Team collaboration (shared Boomer_Angs)

---

## 11. API Endpoints

### Boomer_Ang Management
```javascript
// Create Boomer_Ang
POST /api/boomer-angs
{
  "name": "My Code Assistant",
  "type": "code",
  "voiceEnabled": true,
  "personality": "friendly",
  "models": ["llama-4-scout-128k"],
  "triggers": [
    { "type": "voice_command", "phrase": "build component" }
  ]
}

// List User's Boomer_Angs
GET /api/boomer-angs?userId={userId}&status=active

// Execute Boomer_Ang Command
POST /api/boomer-angs/{id}/execute
{
  "command": "Create a React login form",
  "voiceInput": true,
  "voiceDuration": 3.5
}

// Get Quote Before Execution
POST /api/boomer-angs/{id}/quote
{
  "command": "Analyze 50-page PDF",
  "documents": [{ "pages": 50, "size": "10MB" }]
}

// Get Boomer_Ang Usage Stats
GET /api/boomer-angs/{id}/usage?period=30d
```

### Voice Endpoints
```javascript
// Transcribe Voice (ASR)
POST /api/voice/transcribe
Content-Type: multipart/form-data
{
  "audio": <blob>,
  "language": "en"
}
// Returns: { "transcript": "...", "duration": 3.5, "cost": 0.0001 }

// Text-to-Speech (TTS)
POST /api/voice/speak
{
  "text": "Your Code Boomer_Ang has completed the task.",
  "personality": "friendly"
}
// Returns: { "audio": <url>, "cost": 0.0025 }
```

### Model Routing
```javascript
// Get Best Model for Task
POST /api/models/route
{
  "boomerAngType": "code",
  "taskComplexity": "high",
  "userTier": "medium",
  "contextSize": 50000
}
// Returns: { "model": "gpt-oss-120b-128k", "reason": "...", "alternatives": [...] }

// Get Rising Models
GET /api/models/rising?category=code
// Returns: [{ "id": "...", "name": "...", "sweetSpot": "...", "savings": 0.45 }]
```

### Usage & Credits
```javascript
// Get User Credits
GET /api/credits/{userId}
// Returns: { "tier": "medium", "remaining": 145.50, "resetAt": "..." }

// Get Usage Breakdown
GET /api/usage/{userId}?period=30d
// Returns: { 
//   "total": 54.50, 
//   "byModel": {...}, 
//   "byBoomerAng": {...},
//   "byType": { "llm": 50, "voice": 3.5, "ocr": 1 }
// }
```

---

## 12. Configuration Files

### Environment Variables
```bash
# .env
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-v1-...
DEEPSEEK_OCR_HOST=http://localhost:8000
GPU_HOURLY_RATE=1.50
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_KV_NAMESPACE_ID=...
SUPABASE_URL=https://....supabase.co
SUPABASE_ANON_KEY=eyJ...
WEBHOOK_SECRET=...
```

### Tier Configuration (JSON)
```json
{
  "buy-me-a-coffee": {
    "monthlyPrice": 0,
    "credits": 5,
    "creditMultiplier": 1,
    "boomerAngLimit": 3,
    "models": ["llama-3.1-8b-128k", "gpt-oss-20b-128k"],
    "voiceHours": 1,
    "ttsChars": 10000,
    "storage": "100MB",
    "priority": "low"
  },
  "light": {
    "monthlyPrice": 10,
    "credits": 30,
    "creditMultiplier": 3,
    "boomerAngLimit": 10,
    "models": "groq-all",
    "voiceHours": 10,
    "ttsChars": 100000,
    "storage": "1GB",
    "priority": "standard"
  },
  "medium": {
    "monthlyPrice": 50,
    "credits": 200,
    "creditMultiplier": 4,
    "boomerAngLimit": 50,
    "models": "all",
    "voiceHours": 50,
    "ttsChars": 500000,
    "storage": "10GB",
    "priority": "high",
    "byok": true
  },
  "heavy": {
    "monthlyPrice": 200,
    "credits": 1000,
    "creditMultiplier": 5,
    "boomerAngLimit": -1,
    "models": "all",
    "voiceHours": 200,
    "ttsChars": 2000000,
    "storage": "100GB",
    "priority": "enterprise",
    "byok": true,
    "sla": 0.999
  },
  "superior": {
    "monthlyPrice": "custom",
    "credits": -1,
    "creditMultiplier": "custom",
    "boomerAngLimit": -1,
    "models": "all",
    "voiceHours": -1,
    "ttsChars": -1,
    "storage": "unlimited",
    "priority": "dedicated",
    "byok": true,
    "sla": 0.9999,
    "whiteLabel": true
  }
}
```

---

## Success Criteria

✅ **Boomer_Angs are the user-facing brand** for all AI agents  
✅ **II-Agent modules power the backend** orchestration invisibly  
✅ **Voice-first UX** with Nextel Console on every page  
✅ **Cost transparency** with real-time quotes and breakdowns  
✅ **Tier-based access** to models and features  
✅ **5-tier pricing** with clear value multipliers  
✅ **Model routing** optimizes for speed, cost, and quality  
✅ **DeepSeek-OCR** reduces document costs by 10×  
✅ **Rising Models rail** surfaces new cost-effective options  
✅ **Daily rate refresh** keeps pricing accurate  

---

**Status:** Ready for implementation  
**Timeline:** 8-12 weeks  
**Platform:** ACHEEVY (NURDScode)  
**Last Updated:** November 2, 2025
