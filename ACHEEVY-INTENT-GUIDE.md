# 🤖 ACHEEVY Intent System - Complete Guide

## What is ACHEEVY Intent?

**ACHEEVY Intent** is an intelligent system that discovers, clarifies, and captures user intent through natural conversation. Instead of users manually filling forms, ACHEEVY asks clarifying questions in sequence to understand what they want to build.

### Core Purpose
- **Intent Discovery**: Extract user's true goal from voice or text
- **Progressive Clarification**: Ask 7 strategic questions to build complete understanding
- **PRD Auto-Generation**: Transform conversation into production-ready specifications
- **Behavior Customization**: Train ACHEEVY to ask questions aligned with your business logic

---

## The 7-Question Intent Discovery Flow

### Question 1: **Primary Use Case**
```
"What's the primary use case or problem this app solves?"
```
- Captures the core problem statement
- Example answers: "Zero-day protection for SMBs", "Real-time team messaging"
- Used to determine: App category, market segment, complexity

### Question 2: **Target Users**
```
"Who are your target users? (e.g., developers, enterprises, individuals)"
```
- Identifies end users and their personas
- Example answers: "Fortune 500 companies", "Freelance developers", "K-12 schools"
- Used to determine: UI complexity, security requirements, scalability needs

### Question 3: **Key Features**
```
"What key features are essential for the MVP?"
```
- Lists must-have functionality for launch
- Example answers: "Real-time sync, offline mode, 2FA", "Video calling, screen share, chat"
- Used to determine: Development effort, timeline, technical stack

### Question 4: **Integrations**
```
"What integrations or APIs does this need? (Stripe, Auth, etc.)"
```
- Third-party services required
- Example answers: "Stripe for payments, Slack API, Google Drive", "AWS S3, Auth0, SendGrid"
- Used to determine: Infrastructure, costs, dependencies

### Question 5: **Design Style**
```
"What's the desired design style? (Modern, minimal, playful, enterprise)"
```
- Visual and UX preferences
- Example answers: "Dark mode, glassmorphism", "Clean, minimal", "Colorful and playful"
- Used to determine: Design tokens, component library, animation intensity

### Question 6: **Technologies**
```
"Any specific technologies you prefer?"
```
- Tech stack preferences
- Example answers: "React + TypeScript", "Node.js + PostgreSQL", "Python + FastAPI"
- Used to determine: Scaffolding framework, linting, testing tools

### Question 7: **Timeline**
```
"What's your timeline and launch priority?"
```
- Urgency and constraints
- Example answers: "ASAP, need MVP in 2 weeks", "Production-ready in 3 months"
- Used to determine: Feature scope, deployment strategy, resource allocation

---

## Training ACHEEVY to Behave Specifically

### Method 1: System Prompt Customization

Edit `src/pages/ACHEEVYIntent.jsx` to customize the system prompt:

```jsx
// Add this to your API call
const systemPrompt = `You are ACHEEVY, an expert app architect assistant.

PERSONALITY:
- Professional but friendly
- Ask clarifying follow-ups if answers are vague
- Provide brief examples when needed
- Validate understanding before moving to next question

TONE: ${userPersonality || 'neutral'}
INDUSTRY: ${userIndustry || 'general'}
EXPERTISE_LEVEL: ${userExpertise || 'intermediate'}

When asking questions:
1. Always validate the previous answer
2. Ask one question at a time
3. Provide examples relevant to their domain
4. Be concise (max 2 sentences per question)

Remember: Your goal is to extract enough information to generate a comprehensive PRD.`;
```

### Method 2: Dynamic Question Sets

Create different question sets for different user types:

```jsx
// In src/pages/ACHEEVYIntent.jsx
const QUESTION_SETS = {
  // For startup founders
  'startup': [
    "What's your vision for this product?",
    "What's your target market size?",
    "What problem are you solving that competitors miss?",
    "What's your go-to-market strategy?",
    "What metrics define success?",
    "What's your funding situation?",
    "What's your timeline to launch?"
  ],
  
  // For enterprise teams
  'enterprise': [
    "What business process does this automate?",
    "Who are the key stakeholders?",
    "What compliance requirements apply?",
    "How many users will this support?",
    "What's your integration strategy?",
    "What's your security posture requirement?",
    "What's your deployment preference?"
  ],
  
  // For developers
  'developer': [
    "What's the core technical challenge?",
    "What technology stack are you targeting?",
    "What's the expected scale (QPS, data volume)?",
    "What are the performance requirements?",
    "What databases or services will you use?",
    "What testing strategy?",
    "What's your deployment infrastructure?"
  ],
  
  // For agencies/freelancers
  'agency': [
    "What's the client's primary goal?",
    "What's the client's budget range?",
    "What's the project timeline?",
    "Who are the end users?",
    "What's the client's technical maturity?",
    "What post-launch support is needed?",
    "Any specific constraints or requirements?"
  ]
};
```

### Method 3: Personality Tuning

Create reusable ACHEEVY personalities:

```jsx
// src/constants/acheevy-personalities.js
export const ACHEEVY_PERSONALITIES = {
  // Casual & Fun
  'startup-guru': {
    name: 'ACHEEVY (Startup Mode)',
    tone: 'energetic, optimistic, entrepreneurial',
    style: 'emoji-friendly, enthusiastic',
    examples: 'startup-focused',
    systemPrompt: `You're a startup advisor who gets excited about new ideas. 
      Ask questions like a seasoned founder would. 
      Use startup terminology naturally. 
      Show enthusiasm but stay grounded.`
  },
  
  // Professional & Structured
  'enterprise-architect': {
    name: 'ACHEEVY (Enterprise Mode)',
    tone: 'formal, detailed, thorough',
    style: 'structured, comprehensive',
    examples: 'enterprise-focused',
    systemPrompt: `You're an enterprise architect with decades of experience.
      Ask detailed questions about architecture, scalability, security.
      Focus on organizational impact and ROI.
      Be methodical and systematic.`
  },
  
  // Technical & Deep
  'senior-engineer': {
    name: 'ACHEEVY (Technical Mode)',
    tone: 'technical, precise, analytical',
    style: 'code-aware, performance-focused',
    examples: 'technical-focused',
    systemPrompt: `You're a senior engineer reviewing requirements.
      Ask about performance, scalability, edge cases.
      Challenge assumptions with technical rigor.
      Focus on implementation feasibility.`
  },
  
  // Mentor & Guide
  'business-mentor': {
    name: 'ACHEEVY (Business Mode)',
    tone: 'wise, strategic, market-aware',
    style: 'business-focused, holistic',
    examples: 'business-focused',
    systemPrompt: `You're a successful business mentor and advisor.
      Ask about market, customers, revenue, competition.
      Focus on business model and strategic positioning.
      Help identify real vs. assumed opportunities.`
  }
};
```

### Method 4: Response Processing Pipeline

Customize how ACHEEVY processes answers:

```jsx
// src/utils/acheevy-processors.js
export class ACHEEVYProcessor {
  // Process and validate answers
  static validateAnswer(answer, questionType) {
    const validators = {
      'primary_use_case': (ans) => ans.length > 10,
      'target_users': (ans) => ans.toLowerCase().includes(['business', 'user', 'company', 'developer', 'enterprise'].join('|')),
      'key_features': (ans) => ans.includes(',') || ans.split(' ').length > 5,
      'integrations': (ans) => ans.toLowerCase().match(/stripe|slack|github|google|aws|azure/i),
      'design_style': (ans) => ans.toLowerCase().match(/modern|minimal|dark|light|playful|enterprise/i),
      'technologies': (ans) => ans.toLowerCase().match(/react|vue|angular|node|python|go|rust/i),
      'timeline': (ans) => ans.toLowerCase().match(/week|month|asap|urgent|flexible/i)
    };
    
    const validator = validators[questionType];
    return validator ? validator(answer) : answer.length > 5;
  }
  
  // Extract entities from freeform answers
  static extractEntities(answer) {
    const entities = {
      technologies: answer.match(/\b(React|Vue|Angular|Node|Python|Go|Rust|Java|C#|PHP)\b/gi) || [],
      integrations: answer.match(/\b(Stripe|Slack|GitHub|Google|AWS|Azure|Firebase|Auth0)\b/gi) || [],
      platforms: answer.match(/\b(Web|Mobile|Desktop|iOS|Android|Windows|Mac|Linux)\b/gi) || [],
      timeframes: answer.match(/\b(week|month|quarter|year|asap|urgent|flexible)\b/gi) || [],
      metrics: answer.match(/\b\d+[KMB]?\b/g) || []
    };
    return entities;
  }
  
  // Generate PRD section from conversation
  static generatePRDSection(conversation, sectionType) {
    const sectionGenerators = {
      'executive_summary': (conv) => `${conv[1]} for ${conv[3]}`,
      'success_metrics': (conv) => `Target users: ${conv[3]}. Key features: ${conv[5]}`,
      'technical_spec': (conv) => `Stack: ${conv[11]}. Scale: ${conv[7]}`,
      'timeline': (conv) => `Launch target: ${conv[13]}`
    };
    
    const generator = sectionGenerators[sectionType];
    return generator ? generator(conversation) : '';
  }
}
```

### Method 5: Training Data Integration

Train ACHEEVY with your historical data:

```jsx
// src/utils/acheevy-training.js
export class ACHEEVYTrainer {
  // Load past successful conversations
  static async loadTrainingData(env) {
    const trainingConversations = await env.DB.prepare(`
      SELECT 
        questions, 
        answers, 
        generated_prd,
        user_tier,
        project_type,
        success_score
      FROM acheevy_training_data
      WHERE success_score > 0.8
      ORDER BY created_at DESC
      LIMIT 100
    `).all();
    
    return trainingConversations;
  }
  
  // Extract patterns from successful conversations
  static analyzePatterns(conversations) {
    const patterns = {
      'startup-focused': [],
      'enterprise-focused': [],
      'technical-focused': [],
      'quick-turnaround': [],
      'complex-requirements': []
    };
    
    conversations.forEach(conv => {
      if (conv.project_type === 'startup') {
        patterns['startup-focused'].push({
          questions: conv.questions,
          answers: conv.answers,
          outcome: conv.generated_prd
        });
      }
      // ... similar logic for other types
    });
    
    return patterns;
  }
  
  // Fine-tune prompts based on patterns
  static generateTunedPrompt(userProfile, patterns) {
    const relevantPatterns = patterns[userProfile.type] || [];
    const exampleAnswers = relevantPatterns.slice(0, 3).map(p => p.answers);
    
    return `Based on successful patterns from similar projects:
    
    Example answer structures:
    ${exampleAnswers.map((ex, i) => `\nExample ${i+1}: ${ex.slice(0, 2).join(', ...')}`).join('')}
    
    Ask follow-up questions to extract similar depth and clarity.`;
  }
}
```

---

## Implementing Custom ACHEEVY Behaviors

### Example 1: Strict Validation Mode
```jsx
// Ensure ACHEEVY won't proceed until answers are detailed enough
const STRICT_VALIDATION = {
  'primary_use_case': {
    minLength: 50,
    mustInclude: ['problem', 'user', 'benefit'],
    prompt: "That's a good start! Can you be more specific about: WHO has this problem, WHAT exactly they struggle with, and WHY it matters?"
  },
  'target_users': {
    minLength: 30,
    mustInclude: ['demographics', 'pain points'],
    prompt: "Let's dig deeper. Can you describe their typical day and what frustrates them most?"
  }
};
```

### Example 2: Market Intelligence Mode
```jsx
// ACHEEVY asks about competitors and market positioning
const MARKET_INTELLIGENCE_QUESTIONS = [
  "What existing solutions address this problem today?",
  "What's your competitive advantage?",
  "What's your pricing strategy?",
  "How will you acquire customers?",
  "What metrics show product-market fit?",
  "What's your 12-month vision?"
];
```

### Example 3: Technical Deep-Dive Mode
```jsx
// ACHEEVY focuses on technical architecture
const TECHNICAL_QUESTIONS = [
  "What's the expected user load (concurrent users)?",
  "What's your latency requirement (P95)?",
  "What data persistence strategy?",
  "What's your SLA requirement (99.9%, 99.99%)?",
  "Real-time vs. eventual consistency?",
  "How will you handle failures and recovery?"
];
```

---

## Behavioral Customization API

### In `src/pages/ACHEEVYIntent.jsx`:

```jsx
// Initialize ACHEEVY with custom behavior
const acheevy = new ACHEEVYBrain({
  mode: 'startup', // or 'enterprise', 'technical', 'business'
  personality: 'energetic', // or 'formal', 'technical', 'mentor'
  strictValidation: true,
  focusAreas: ['product-market-fit', 'technical-feasibility'],
  maxQuestionsCount: 7,
  allowFollowUps: true,
  examples: 'startup-focused',
  validationRules: STRICT_VALIDATION,
  trainingData: await loadTrainingData()
});

// Start conversation with context
await acheevy.startSession({
  userType: 'founder',
  industry: 'fintech',
  experience: 'first-time',
  timezone: 'PST'
});
```

---

## API Endpoint for Custom Training

### Endpoint: `POST /api/acheevy/train`

```javascript
{
  "model": "acheevy-v1",
  "trainingData": [
    {
      "conversation": ["Q1", "A1", "Q2", "A2", ...],
      "outcome": "successful_prd",
      "metrics": {
        "clarityScore": 0.95,
        "completenessScore": 0.92,
        "feasibilityScore": 0.88
      }
    }
  ],
  "customBehaviors": {
    "strictMode": true,
    "focusOn": ["market", "technical"],
    "personality": "mentor"
  }
}
```

---

## Monitoring & Improving ACHEEVY

### Key Metrics to Track

```javascript
// src/utils/acheevy-metrics.js
export const ACHEEVY_METRICS = {
  conversation_quality: {
    clarity_score: 'How clear are the answers?',
    completeness_score: 'Is enough info captured?',
    actionability_score: 'Can engineers build from this?'
  },
  
  user_satisfaction: {
    conversation_ease: 'Was it easy to answer?',
    time_to_complete: 'How long did it take?',
    understanding_match: 'Did ACHEEVY understand correctly?'
  },
  
  prd_quality: {
    feature_coverage: 'Did it capture all features?',
    technical_accuracy: 'Are specs correct?',
    estimation_accuracy: 'Were timelines correct?'
  }
};
```

### Feedback Loop

```jsx
// After PRD is approved, collect feedback
const feedbackForm = {
  "question_1_clarity": 1-5,
  "question_2_clarity": 1-5,
  // ...
  "prd_accuracy": 1-5,
  "prd_completeness": 1-5,
  "suggested_improvements": "free text",
  "was_helpful": true/false
};

// Use feedback to retrain ACHEEVY
```

---

## Quick Start: Training Your Own ACHEEVY

### Step 1: Define Your Personality
```javascript
const myACHEEVY = {
  name: "BuilderBot",
  tone: "encouraging, direct",
  expertise: "mobile-apps",
  questions: [
    "What does your app do?",
    "Who are the users?",
    // ... your custom questions
  ]
};
```

### Step 2: Create System Prompt
```javascript
const systemPrompt = `You are BuilderBot, an expert mobile app architect.
- Tone: ${myACHEEVY.tone}
- Expertise: ${myACHEEVY.expertise}
- Ask one question at a time
- Validate answers before moving on`;
```

### Step 3: Deploy & Monitor
```javascript
// Deploy to your API
await env.KV.put('acheevy-profile:builderbot', JSON.stringify(myACHEEVY));

// Monitor performance
const metrics = await trackACHEEVYPerformance('builderbot');
console.log(`Conversation completion rate: ${metrics.completionRate}%`);
console.log(`User satisfaction: ${metrics.avgSatisfaction}/5`);
```

---

## Summary

**ACHEEVY Intent** is your AI-powered requirements gathering assistant that:
- ✅ Asks clarifying questions in natural conversation
- ✅ Extracts intent through dialogue
- ✅ Generates complete PRDs automatically
- ✅ Can be trained for specific behaviors
- ✅ Improves over time with feedback

**Train it by:**
1. Customizing questions & prompts
2. Defining personality & tone
3. Setting validation rules
4. Using historical data
5. Collecting & applying feedback

---
