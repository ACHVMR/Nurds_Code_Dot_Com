# Voice-First ACHEEVY Platform - PRD & Sprint Checklist
**Date:** November 2, 2025  
**Status:** SPRINT MODE - Immediate Implementation  
**Platform:** NURDScode (ACHEEVY Orchestrator)

---

## Critical Corrections & Requirements

### 1. Voice Integration (PRIMARY)
❌ **NOT USING:** PlayAI TTS ($50/1M chars)  
✅ **USING:** Groq Whisper v3 ($0.04-$0.111/hour) for ASR  
✅ **FALLBACK:** Most compatible OpenAI LLM (lowest price) if Groq Whisper unavailable  
✅ **NLP Model:** GPT-4o-mini or GPT-4.1-nano (for active agent/task routing)  
✅ **Alternative ASR:** Deepgram or ElevenLabs if needed  

**Voice-First Paradigm:**
- Voice BEFORE text (primary input method)
- AI response is SPOKEN first (user can toggle to read-only)
- Free voice conversation throughout platform
- Tier pricing covers voice integration costs
- Users can toggle voice on/off with cost transparency

### 2. ACHEEVY = Exclusive II-Agent Orchestrator
- II-Agent modules are ONLY for ACHEEVY (not user-facing)
- Boomer_Angs = User-created agents powered by ACHEEVY
- II-Agent stays in backend, never exposed to users

### 3. Nextel Phone UI
❌ **NOT:** Generic floating console  
✅ **YES:** Large Nextel-style flip phone UI that pops up on screen  
✅ **FALLBACK:** Small animated flip phone with chirp sound effect  
✅ **CHAT WINDOW:** Appears inside the phone interface  

### 4. Model Loading Strategy
❌ **NOT:** Load 300-500 models from OpenRouter  
✅ **YES:** Load only 8 primary models  
✅ **SECONDARY:** Separate page/element/container for additional models  
✅ **USER ACCOUNT:** "Integrations" section for BYOK (Bring Your Own Key)  
✅ **REASONING:** Use OpenRouter so users DON'T need to bring keys (we get best prices)

### 5. DeepSeek OCR
✅ **PRIMARY USE:** Picture/image compression  
✅ **VERIFY:** Check if it does more than just images

### 6. Pricing Tiers (CORRECTED)
❌ **NOT:** "Light" (L-I-G-H-T)  
✅ **YES:** "Lite" (L-I-T-E - not heavy)  
✅ **INTEGRATION:** Incorporate Plus One pricing model from previous work  
✅ **TRANSPARENCY:** Show token usage estimates BEFORE every task  

**Tier Structure:**
1. Buy-Me-A-Coffee (Free) - Limited access
2. Lite - Basic features
3. Medium - Standard features
4. Heavy - Advanced features
5. Superior - Full platform access (highest tier gets everything)

### 7. Quote Engine (MANDATORY)
- Show cost estimate BEFORE every task execution
- Display token allotment usage in real-time
- Voice cost breakdown (toggle-able)
- Balance between Manus AI (no visibility) and GenSpark (high retention)
- Give users control over spending

### 8. Boomer_Ang Builder (CORRECTED ORDER)
❌ **OLD:** Type → Voice → Models → Triggers → Quote  
✅ **NEW:** **VOICE → Type** → Models → Triggers → Quote  

**Clarifications Needed:**
- What are "Triggers"? (Need explanation)

### 9. User-Facing vs Backend
✅ **USER SEES:** Simple interface, voice interaction, Boomer_Angs  
❌ **USER DOESN'T SEE:** Model routing, II-Agent modules, backend tools  
✅ **SUPER ADMIN ONLY:** All integrations, routing logic, module configs  
✅ **TIER-GATED:** Features activated by subscription level (highest tier = full access)

### 10. Voice Customization
✅ **REQUIRED:**
- Custom/uploaded voices for ACHEEVY persona
- Default voices provided (multiple options)
- User can upload preferred voices
- Voice personality selection
- Toggle between speaking/reading responses

### 11. Database (Supabase)
✅ **BUILD:** All schemas in Supabase backend  
✅ **AUDIT:** Manual review needed for proper integration  
✅ **TABLES:** boomer_angs, usage_ledger, tier_credits, voice_settings

### 12. Timeline
❌ **NOT:** 8-12 weeks  
✅ **YES:** SPRINT NOW (immediate implementation)

---

## Implementation Checklist (Sprint Order)

### Phase 1: Voice Infrastructure (CRITICAL - Days 1-2)
- [ ] **1.1** Research Groq Whisper v3 API integration
  - [ ] Test ASR endpoint ($0.04-$0.111/hour)
  - [ ] Verify 10-second minimum billing
  - [ ] Check language support (en, es, fr, de, pt, zh, ja, ko)
  - [ ] If unavailable → Test Deepgram alternative
  - [ ] If unavailable → Test ElevenLabs alternative

- [ ] **1.2** Set up NLP routing model
  - [ ] Test GPT-4o-mini for task inference
  - [ ] Test GPT-4.1-nano as fallback
  - [ ] Wire to active agent detection
  - [ ] Connect to Boomer_Ang type routing

- [ ] **1.3** Voice response system
  - [ ] OpenAI TTS integration (lowest price compatible model)
  - [ ] Test streaming audio responses
  - [ ] Implement voice toggle (speak/read)
  - [ ] Add cost tracking per response

- [ ] **1.4** Voice settings
  - [ ] Default ACHEEVY voices (3-5 options)
  - [ ] User voice upload system
  - [ ] Voice personality selector
  - [ ] Voice storage in Supabase

### Phase 2: Nextel Phone UI (Days 2-3)
- [ ] **2.1** Design Nextel flip phone component
  - [ ] Large phone variant (primary)
  - [ ] Small animated flip phone (fallback)
  - [ ] Chirp sound effect asset
  - [ ] Open/close animations

- [ ] **2.2** Chat interface inside phone
  - [ ] Message bubbles (ACHEEVY branded)
  - [ ] Voice waveform indicator (when speaking)
  - [ ] Cost display per message
  - [ ] Token counter

- [ ] **2.3** Phone placement & behavior
  - [ ] Persistent on all pages
  - [ ] Floating position (adjustable)
  - [ ] Minimize/maximize states
  - [ ] Mobile responsive version

### Phase 3: Model Integration (Days 3-4)
- [ ] **3.1** Primary models (8 only)
  - [ ] Groq: llama-4-scout-128k
  - [ ] Groq: gpt-oss-20b-128k
  - [ ] Groq: qwen3-32b-131k
  - [ ] Groq: llama-3.3-70b-128k
  - [ ] OpenRouter: gpt-4o-mini
  - [ ] OpenRouter: claude-3-5-sonnet
  - [ ] OpenRouter: gemini-2.0-flash
  - [ ] OpenRouter: deepseek-chat

- [ ] **3.2** Secondary model selector
  - [ ] Separate page/modal/expandable section
  - [ ] Load on-demand (not default)
  - [ ] Search/filter functionality
  - [ ] "Rising Models" category

- [ ] **3.3** OpenRouter integration
  - [ ] Single API key setup (platform-level)
  - [ ] Pass-through pricing
  - [ ] Handle 5.5% fee calculation
  - [ ] BYOK support (optional for teams)

### Phase 4: Pricing & Tiers (Days 4-5)
- [ ] **4.1** Retrieve Plus One pricing model
  - [ ] Review previous Plus One implementation
  - [ ] Extract tier structure
  - [ ] Extract token allocations
  - [ ] Extract feature gates

- [ ] **4.2** Merge with corrected tiers
  - [ ] Buy-Me-A-Coffee (free tier)
  - [ ] Lite (not "Light")
  - [ ] Medium
  - [ ] Heavy
  - [ ] Superior (highest - full access)

- [ ] **4.3** Voice cost integration
  - [ ] Calculate ASR costs per tier
  - [ ] Calculate TTS costs per tier
  - [ ] Bundle into monthly pricing
  - [ ] Show voice usage separately in quotes

- [ ] **4.4** Tier configuration table
  - [ ] Supabase schema: `tier_configs`
  - [ ] Feature flags per tier
  - [ ] Model access per tier
  - [ ] Voice limits per tier
  - [ ] Boomer_Ang limits per tier

### Phase 5: Quote Engine (Days 5-6)
- [ ] **5.1** Pre-execution quote system
  - [ ] Token estimation algorithm
  - [ ] Voice cost calculator (ASR + TTS)
  - [ ] Model cost lookup (RateStore)
  - [ ] Tier multiplier application

- [ ] **5.2** Quote UI component
  - [ ] Modal/inline display
  - [ ] Breakdown: LLM + Voice + Total
  - [ ] Approve/Cancel buttons
  - [ ] "Don't show again" option (per session)

- [ ] **5.3** Real-time usage tracking
  - [ ] Token counter during execution
  - [ ] Cost accumulator
  - [ ] Remaining balance display
  - [ ] Warning at 80% usage

### Phase 6: Boomer_Ang Builder (Days 6-7)
- [ ] **6.1** Builder flow (VOICE FIRST)
  - [ ] Step 1: **VOICE** - Record/test voice command
  - [ ] Step 2: **Type** - Select agent category
  - [ ] Step 3: **Models** - Choose primary model
  - [ ] Step 4: **Triggers** - [CLARIFY: What are triggers?]
  - [ ] Step 5: **Quote** - Preview costs

- [ ] **6.2** Voice-first onboarding
  - [ ] "Say what you want to build" prompt
  - [ ] ASR capture → NLP parse → Agent type suggestion
  - [ ] Voice confirmation workflow

- [ ] **6.3** Agent type templates
  - [ ] Code Boomer_Ang (software dev)
  - [ ] Task Boomer_Ang (automation)
  - [ ] Data Boomer_Ang (analytics)
  - [ ] Research Boomer_Ang (info gathering)
  - [ ] Creative Boomer_Ang (content)

### Phase 7: Backend Architecture (Days 7-8)
- [ ] **7.1** ACHEEVY orchestrator (exclusive)
  - [ ] Wire all 17 II-Agent modules to ACHEEVY
  - [ ] Hide II-Agent from user-facing UI
  - [ ] Backend-only routing

- [ ] **7.2** Boomer_Ang execution engine
  - [ ] Voice command → NLP → Agent type
  - [ ] Agent type → II-Agent module dispatch
  - [ ] Module → Model router
  - [ ] Model → Execute → Stream response
  - [ ] Response → TTS → User

- [ ] **7.3** Super admin dashboard
  - [ ] View all routing logic
  - [ ] Access all integrations
  - [ ] Configure II-Agent modules
  - [ ] Tier feature management

### Phase 8: Database Schemas (Days 8-9)
- [ ] **8.1** Core tables (Supabase)
  ```sql
  -- boomer_angs (user agents)
  -- usage_ledger (cost tracking)
  -- tier_credits (monthly allocations)
  -- voice_settings (user preferences)
  -- voice_uploads (custom voices)
  -- quotes_history (pre-execution estimates)
  -- model_rates (daily refresh from APIs)
  ```

- [ ] **8.2** Audit & verification
  - [ ] Test all table relationships
  - [ ] Verify RLS policies
  - [ ] Check indexes
  - [ ] Test migrations

- [ ] **8.3** Seed data
  - [ ] Default ACHEEVY voices (3-5)
  - [ ] Tier configurations
  - [ ] Initial model rates
  - [ ] 17 II-Agent modules (hidden from users)

### Phase 9: Integration Testing (Days 9-10)
- [ ] **9.1** Voice flow end-to-end
  - [ ] User speaks → ASR → NLP → Agent routing
  - [ ] Quote display → Approval → Execution
  - [ ] Response → TTS → Audio playback
  - [ ] Cost deduction from tier credits

- [ ] **9.2** Tier restrictions
  - [ ] Buy-Me-A-Coffee: Limited models only
  - [ ] Lite: Basic feature set
  - [ ] Medium: Standard features
  - [ ] Heavy: Advanced features
  - [ ] Superior: ALL features unlocked

- [ ] **9.3** Cost transparency
  - [ ] Pre-execution quotes accurate
  - [ ] Real-time usage tracking
  - [ ] Post-execution reconciliation
  - [ ] Monthly usage reports

### Phase 10: Polish & Deploy (Days 10-11)
- [ ] **10.1** Nextel phone animations
  - [ ] Smooth open/close
  - [ ] Chirp sound timing
  - [ ] Voice waveforms
  - [ ] Loading states

- [ ] **10.2** Mobile optimization
  - [ ] Smaller phone on mobile
  - [ ] Touch-friendly controls
  - [ ] Voice button accessibility

- [ ] **10.3** Error handling
  - [ ] ASR failures → fallback to text
  - [ ] TTS failures → show text only
  - [ ] Model unavailable → suggest alternative
  - [ ] Insufficient credits → upgrade prompt

- [ ] **10.4** Production deployment
  - [ ] Environment variables set
  - [ ] API keys configured
  - [ ] Supabase migrations applied
  - [ ] Cloudflare Workers deployed

---

## ✅ Questions ANSWERED - Ready to Sprint

### Q1: Triggers (Boomer_Ang Builder Step 4)
**ANSWER:** "Yes, these are things ACHEEVY would assist with or Commons (Boomer_Angs)"

**Triggers Include:**
- ✅ Voice command phrases that activate the agent
- ✅ Webhook endpoints that trigger the agent
- ✅ Scheduled cron jobs
- ✅ File upload events
- ✅ Manual button clicks in UI
- ✅ **ALL OF THE ABOVE**

### Q2: DeepSeek OCR Scope
**ANSWER:** "Max capability"

**DeepSeek OCR Features:**
- ✅ Image OCR (screenshots, photos, diagrams)
- ✅ PDF text extraction (full document processing)
- ✅ ~10× compression at 97% precision
- ✅ Both visual and text content extraction
- ✅ Maximum capability mode (no limitations)

### Q3: Plus One Pricing - FOUND & EXPANDED

**EXISTING IMPLEMENTATION** (from COLLABORATION_IDENTITY_PRD.md):

| Members | Monthly Price | Daily Rate | Discount |
|---------|--------------|------------|----------|
| 1 member | $17.99/mo | $1.00/day | - |
| 2 members | $13.99/mo per member | $1.00/day | 22% off |
| 4 members | $10.99/mo per member | $1.00/day | 39% off |
| 5+ members | $7.99/mo per member | $1.00/day | 56% off |

**Daily Collaboration**: $1/day per added member (no subscription required)

**NEW VOICE-FIRST ADDITIONS:**

1. **Collaboration Platforms:**
   - Google Meet SDK (NEW - needs implementation)
   - Zoom Video SDK (existing)
   - Microsoft Teams SDK v2.0 (existing)
   - User chooses preferred platform per session

2. **Context Engineering Focus:**
   - Ticker around context window: "You're not just vibe coding, you're context engineering"
   - Bottom ticker with resume-relevant terminology (changes based on user profile)
   - Messaging emphasizes professional context management, not just coding

3. **Personalization System:**
   - Custom instructions form in account settings (career goals, current projects, interests, company type, personality)
   - RAG + memory integration for context-aware recommendations
   - Daily algorithmic build suggestions based on user profile
   - Self-evolving AI integration (Microsoft + Google latest releases, if APIs available)

4. **Plus One Invitation Flow:**
   - Show cost preview before adding collaborator ($1/day or subscription savings)
   - Encourage subscription upgrades (progressive discounts)
   - Max 5 collaborators per project (hard cap)
   - Visual pricing comparison (daily vs monthly savings)

---

## API Endpoints (Sprint Implementation)

### Voice Endpoints
```javascript
// ASR (Groq Whisper or fallback)
POST /api/voice/transcribe
Content-Type: multipart/form-data
{ audio: <blob>, language: 'en' }
→ { transcript, duration, cost }

// TTS (OpenAI or compatible)
POST /api/voice/speak
{ text, voiceId, personality }
→ { audioUrl, cost, duration }

// Upload custom voice
POST /api/voice/upload
Content-Type: multipart/form-data
{ userId, voiceFile, name }
→ { voiceId, status }
```

### Boomer_Ang Endpoints
```javascript
// Create via voice
POST /api/boomer-angs/create-from-voice
{ transcript, userId }
→ { suggestedType, suggestedName, quote }

// Execute with quote
POST /api/boomer-angs/{id}/execute
{ command, voiceEnabled, approveQuote }
→ { response, audioUrl, cost, tokens }
```

### Quote Endpoints
```javascript
// Get pre-execution quote
POST /api/quotes/estimate
{ boomerAngId, command, voiceEnabled }
→ { llmCost, voiceCost, total, breakdown }
```

### Tier Endpoints
```javascript
// Get user tier info
GET /api/tiers/{userId}
→ { tier, creditsRemaining, features, limits }
```

---

## Success Criteria

✅ Voice is PRIMARY input method  
✅ Responses are SPOKEN first (toggle-able to text)  
✅ Nextel phone UI (large or small animated)  
✅ Only 8 models load by default  
✅ Secondary model selector separate  
✅ ACHEEVY = exclusive II-Agent orchestrator  
✅ Users never see II-Agent modules  
✅ Quote before EVERY task execution  
✅ Real-time cost tracking  
✅ Tier-gated features (Superior = full access)  
✅ Custom voice uploads working  
✅ Plus One pricing integrated  
✅ Lite (not Light) tier naming  
✅ All Supabase schemas built and audited  

---

## Risk Mitigation

**Risk 1:** Groq Whisper API unavailable  
**Mitigation:** Deepgram → ElevenLabs → OpenAI Whisper fallback chain

**Risk 2:** Voice costs too high per tier  
**Mitigation:** Bundle voice into tier pricing, show toggle for cost-conscious users

**Risk 3:** Nextel phone UI too complex  
**Mitigation:** Build simple animated version first, iterate to large phone

**Risk 4:** 8 models insufficient  
**Mitigation:** Secondary selector loads more on-demand

**Risk 5:** NLP model routing inaccurate  
**Mitigation:** Manual agent type selection as fallback

---

## 🚀 SPRINT IMPLEMENTATION PLAN

**Mode:** SPRINT (not 8-12 weeks)  
**Start:** NOW  
**Target:** 11 days (3 phases × 3-4 days each)  
**Team:** Full focus, daily standups, immediate blocker resolution

---

### PHASE 1: Voice Infrastructure (Days 1-4)

#### Day 1-2: Groq Whisper v3 Integration ✅
**Files to Create:**
- [ ] `src/components/VoiceRecorder.jsx` - Audio recording component
- [ ] `src/services/groqWhisper.js` - Groq Whisper API client
- [ ] `src/hooks/useVoiceRecording.js` - Recording state management

**Files to Modify:**
- [ ] `workers/api.js` - Add `POST /api/voice/transcribe` endpoint
- [ ] `supabase/migrations/0006_voice_system.sql` - Create `voice_profiles`, `voice_conversations`, `usage_ledger`

**Tasks:**
- [ ] Setup Groq API key in CloudFlare Workers secrets
- [ ] Implement 10-second minimum billing logic
- [ ] Add fallback chain: Groq → Deepgram → ElevenLabs → OpenAI
- [ ] Test ASR accuracy with various accents/noise levels
- [ ] Add cost tracking to usage_ledger table

**Success Criteria:**
- ✅ Voice input works on first try
- ✅ Transcript appears within 2 seconds
- ✅ Fallback activates if Groq fails
- ✅ Costs tracked per user per session

---

#### Day 3: Voice NLP Router ✅
**Files to Create:**
- [ ] `src/services/voiceRouter.js` - GPT-4o-mini intent detection
- [ ] `src/components/VoiceCommandOverlay.jsx` - Shows detected intent

**Files to Modify:**
- [ ] `workers/api.js` - Add `POST /api/voice/route` endpoint

**Tasks:**
- [ ] Integrate GPT-4o-mini OR GPT-4.1-nano OR GPT-5-nano
- [ ] Map voice commands to agent actions (create, execute, modify, delete)
- [ ] Add confidence scoring (0-100%)
- [ ] Show manual type selector if confidence < 70%
- [ ] Test routing accuracy with 50+ sample commands

**Success Criteria:**
- ✅ 90%+ intent detection accuracy
- ✅ < 500ms routing latency
- ✅ Fallback to manual selection if uncertain

---

#### Day 4: TTS Integration ✅
**Files to Create:**
- [ ] `src/services/groqTTS.js` - TTS client (Groq-compatible OR OpenAI)
- [ ] `src/components/VoicePlayback.jsx` - Audio player with controls

**Files to Modify:**
- [ ] `workers/api.js` - Add `POST /api/voice/speak` endpoint

**Tasks:**
- [ ] Research Groq-compatible TTS options (NOT PlayAI)
- [ ] Integrate chosen provider (OpenAI TTS as fallback)
- [ ] Add voice playback with pause/resume/speed controls
- [ ] Implement toggle: "Read response" vs "Hear response"
- [ ] Test TTS quality (clarity, naturalness, latency)

**Success Criteria:**
- ✅ TTS voice sounds natural (not robotic)
- ✅ Response spoken within 3 seconds
- ✅ Toggle between voice/text works instantly
- ✅ Voice costs absorbed into tier pricing

---

### PHASE 2: Nextel Phone UI + Plus One (Days 5-8)

#### Day 5-6: Nextel Flip Phone Component ✅
**Files to Create:**
- [ ] `src/components/NextelPhone.jsx` - Large flip phone UI
- [ ] `src/components/NextelPhoneMini.jsx` - Small animated fallback
- [ ] `src/assets/sounds/chirp-open.mp3` - Chirp sound on open
- [ ] `src/assets/sounds/chirp-message.mp3` - Chirp on message
- [ ] `src/hooks/useNextelPhone.js` - Phone state (open/closed)

**Files to Modify:**
- [ ] `src/pages/Home.jsx` - Replace chat with Nextel phone
- [ ] `src/components/Navbar.jsx` - Add phone toggle icon

**Tasks:**
- [ ] Design large flip phone SVG (black with neon green accents)
- [ ] Implement open/close animation (flip motion)
- [ ] Add chat window inside phone screen
- [ ] Create chirp sound effects (3 variants: open, send, receive)
- [ ] Add mute toggle for sound effects
- [ ] Build small animated phone (fallback for mobile)
- [ ] Test responsive behavior (desktop vs mobile)

**Success Criteria:**
- ✅ Nextel phone looks authentic (Nothing Brand styled)
- ✅ Chirp sounds play on key actions
- ✅ Chat window fits naturally inside phone screen
- ✅ Animation smooth (60fps)
- ✅ Small phone works on mobile (<768px)

---

#### Day 7: Voice Personality System ✅
**Files to Create:**
- [ ] `src/components/VoiceSelector.jsx` - Voice library picker
- [ ] `src/components/VoiceUploader.jsx` - Custom voice upload
- [ ] `src/pages/VoiceSettings.jsx` - Account settings for voice

**Files to Modify:**
- [ ] `workers/api.js` - Add `POST /api/voice/upload`, `GET /api/voice/library`
- [ ] `supabase/migrations/0006_voice_system.sql` - Add custom voices to voice_profiles

**Tasks:**
- [ ] Create voice library (10-15 preset voices)
- [ ] Add voice sample playback (15 second clips)
- [ ] Implement custom voice upload (max 5MB, .mp3/.wav)
- [ ] Process custom voice for TTS fine-tuning
- [ ] Test voice switching (instant apply)

**Success Criteria:**
- ✅ Voice library loads quickly
- ✅ Voice samples play inline
- ✅ Custom voice upload works (verified audio format)
- ✅ Voice switching takes < 1 second

---

#### Day 8: Plus One Pricing Integration ✅
**Files to Create:**
- [ ] `src/components/PlusOnePricing.jsx` - Pricing comparison table
- [ ] `src/components/CollaboratorInvite.jsx` - Invite modal with cost preview

**Files to Modify:**
- [ ] `workers/api.js` - Update `POST /api/collaboration/invite` with pricing logic
- [ ] `supabase/migrations/0006_voice_system.sql` - Add `collaboration_billing` table
- [ ] `src/pages/CollaborationProjects.jsx` - Show Plus One pricing

**Tasks:**
- [ ] Display pricing table (1-5 members with progressive discounts)
- [ ] Show cost preview before inviting collaborator ($1/day or subscription savings)
- [ ] Add subscription upgrade prompts ("Save 22% with monthly!")
- [ ] Implement daily charge cron job (CloudFlare Workers Cron)
- [ ] Cap at 5 collaborators (hard limit in API)
- [ ] Test billing accuracy (daily vs monthly calculations)

**Success Criteria:**
- ✅ Pricing table matches specification exactly
- ✅ Cost preview accurate before invite
- ✅ Daily charges deduct correctly
- ✅ Subscription discounts applied properly
- ✅ Max 5 collaborators enforced

---

### PHASE 3: Context Engineering + Polish (Days 9-11)

#### Day 9: Google Meet Integration ✅
**Files to Create:**
- [ ] `src/services/googleMeet.js` - Google Meet API client
- [ ] `src/components/GoogleMeetButton.jsx` - "Start Google Meet" button

**Files to Modify:**
- [ ] `workers/api.js` - Add `POST /api/meetings/google-meet/create`
- [ ] `src/pages/MeetingHub.jsx` - Add Google Meet option (alongside Zoom + Teams)

**Tasks:**
- [ ] Install Google Meet SDK (or REST API)
- [ ] Setup Google Cloud OAuth credentials
- [ ] Implement meeting creation endpoint
- [ ] Add "Choose Platform" selector (Google Meet | Zoom | Teams)
- [ ] Test meeting creation + joining

**Success Criteria:**
- ✅ Google Meet meetings create successfully
- ✅ Users can choose preferred platform
- ✅ Meeting links work (verified by joining)

---

#### Day 10: Context Engineering Messaging ✅
**Files to Create:**
- [ ] `src/components/ContextTicker.jsx` - Ticker around context window
- [ ] `src/components/TerminologyTicker.jsx` - Bottom ticker with resume terms
- [ ] `src/data/contextMessages.js` - Rotating ticker messages

**Files to Modify:**
- [ ] `src/pages/Editor.jsx` - Add ContextTicker around Monaco Editor
- [ ] `src/components/Footer.jsx` - Add TerminologyTicker

**Tasks:**
- [ ] Create ticker component (smooth horizontal scroll)
- [ ] Add rotating messages: "You're not just vibe coding, you're context engineering"
- [ ] Pull user profile from custom_instructions (career goals, interests)
- [ ] Generate resume-relevant terms based on profile
- [ ] Test ticker performance (no layout shift)

**Success Criteria:**
- ✅ Ticker scrolls smoothly (no jank)
- ✅ Messages rotate every 10 seconds
- ✅ Bottom ticker shows user-specific terminology
- ✅ Professional tone maintained

---

#### Day 11: Custom Instructions + RAG + Free Tier ✅
**Files to Create:**
- [ ] `src/pages/CustomInstructions.jsx` - Account settings form
- [ ] `src/services/ragService.js` - Vector database queries
- [ ] `src/components/DailyInsights.jsx` - Personalized build suggestions

**Files to Modify:**
- [ ] `workers/api.js` - Add `POST /api/instructions/save`, `GET /api/insights/daily`
- [ ] `supabase/migrations/0006_voice_system.sql` - Add `custom_instructions`, `daily_insights` tables
- [ ] `src/pages/Pricing.jsx` - Add FREE tier (below Buy-Me-A-Coffee)

**Tasks:**
- [ ] Build custom instructions form (career goals, projects, interests, company, personality)
- [ ] Integrate Supabase pgvector for RAG
- [ ] Implement daily insights algorithm (runs at midnight UTC)
- [ ] Generate personalized build suggestions based on user profile
- [ ] Add FREE tier to pricing page (GROQ models only, 2 projects max)
- [ ] Enforce free tier limits in API endpoints
- [ ] Test self-evolving AI integration (Microsoft + Google APIs if available)

**Success Criteria:**
- ✅ Custom instructions save successfully
- ✅ RAG returns relevant context (verified manually)
- ✅ Daily insights appear in dashboard
- ✅ Free tier limits enforced (GROQ only, 2 projects)
- ✅ Upgrade prompts show when limits hit

---

## 📋 SPRINT CHECKLIST SUMMARY

### ✅ MUST HAVE (MVP)
- [ ] Voice input works (Groq Whisper v3)
- [ ] Voice NLP routing functional
- [ ] TTS responses spoken first
- [ ] Nextel phone UI (large or small)
- [ ] Plus One pricing integrated
- [ ] Google Meet option added
- [ ] Context engineering ticker
- [ ] Free tier (GROQ only, 2 projects)

### 🎯 NICE TO HAVE (Post-Sprint)
- [ ] Custom voice uploads
- [ ] Daily personalized insights
- [ ] Self-evolving AI integration
- [ ] Advanced RAG features
- [ ] Voice personality fine-tuning

### 🚫 OUT OF SCOPE (Task 9+)
- V0 chat SDK endpoints
- Transcribe API endpoints
- Web3 NFT/balance endpoints
- Production deployment

---

## 🔥 IMMEDIATE NEXT STEPS

1. ✅ **DONE:** Answered all 3 PRD questions
2. ✅ **DONE:** Retrieved Plus One pricing from COLLABORATION_IDENTITY_PRD.md
3. **NOW:** Create migration 0006 (voice_system.sql)
4. **NEXT:** Build VoiceRecorder.jsx component
5. **THEN:** Setup Groq Whisper API in CloudFlare Workers

---

**Sprint Mode: ACTIVE**  
**Blockers:** NONE (all questions answered)  
**Ready to Code:** YES ✅
