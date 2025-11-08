# 🎙️ TASK 8: Voice-First Platform Implementation

**Status:** 🚀 READY TO SPRINT  
**Mode:** Sprint (11 days, 3 phases)  
**Blockers:** ✅ NONE (all questions answered)  
**Dependencies:** Tasks 1-7 complete, migration 0006 ready

---

## 📋 OVERVIEW

### What Changed

**BEFORE (Text-First):**
- Text input primary, voice optional
- Model selection exposed to users
- PlayAI TTS ($50/1M chars)
- "Light" tier spelling
- No free tier below Buy-Me-A-Coffee
- Collaboration pricing unclear
- 300-500 models loading
- 8-12 week timeline

**AFTER (Voice-First):**
- ✅ Voice input PRIMARY, text secondary
- ✅ Model routing hidden (super admin only)
- ✅ Groq Whisper v3 ASR ($0.04-$0.111/hour)
- ✅ OpenAI-compatible TTS (NOT PlayAI)
- ✅ "Lite" spelling (L-I-T-E)
- ✅ FREE tier added (GROQ only, 2 projects)
- ✅ Plus One pricing integrated ($1/day or subscription discounts)
- ✅ Only 8 models load (secondary selector for rest)
- ✅ Sprint timeline (11 days)
- ✅ Nextel flip phone UI with chirp sounds
- ✅ Context engineering messaging
- ✅ Google Meet integration
- ✅ Custom instructions + RAG + memory

---

## 🎯 SUCCESS CRITERIA

### Must Have (MVP)
- [x] Voice input works (Groq Whisper v3)
- [x] Voice NLP routing functional (GPT-4o-mini/nano)
- [x] TTS responses spoken first (toggle-able)
- [x] Nextel phone UI (large or small animated)
- [x] Plus One pricing integrated ($1/day + subscription discounts)
- [x] Google Meet option added
- [x] Context engineering ticker ("You're not just vibe coding, you're context engineering")
- [x] Free tier (GROQ only, 2 projects max)
- [x] Quote before EVERY task execution
- [x] Real-time cost tracking
- [x] Tier-gated features

### Nice to Have (Post-Sprint)
- [ ] Custom voice uploads
- [ ] Daily personalized insights
- [ ] Self-evolving AI integration
- [ ] Advanced RAG features
- [ ] Voice personality fine-tuning

---

## 📊 PROGRESS TRACKING

### Overall Sprint Progress: 0% (Day 0 of 11)

**Phase 1 (Days 1-4):** Voice Infrastructure 🔲 0%  
**Phase 2 (Days 5-8):** Nextel UI + Plus One 🔲 0%  
**Phase 3 (Days 9-11):** Context Engineering 🔲 0%

---

## 🗂️ FILES TO CREATE (24 new files)

### Components (11 files)
1. `src/components/VoiceRecorder.jsx` - Audio recording component
2. `src/components/VoiceCommandOverlay.jsx` - Shows detected intent
3. `src/components/VoicePlayback.jsx` - Audio player with controls
4. `src/components/NextelPhone.jsx` - Large flip phone UI
5. `src/components/NextelPhoneMini.jsx` - Small animated fallback
6. `src/components/VoiceSelector.jsx` - Voice library picker
7. `src/components/VoiceUploader.jsx` - Custom voice upload
8. `src/components/PlusOnePricing.jsx` - Pricing comparison table
9. `src/components/CollaboratorInvite.jsx` - Invite modal with cost preview
10. `src/components/ContextTicker.jsx` - Ticker around context window
11. `src/components/TerminologyTicker.jsx` - Bottom ticker with resume terms

### Pages (3 files)
12. `src/pages/VoiceSettings.jsx` - Account settings for voice
13. `src/pages/CustomInstructions.jsx` - User profile form
14. `src/components/DailyInsights.jsx` - Personalized build suggestions

### Services (4 files)
15. `src/services/groqWhisper.js` - Groq Whisper API client
16. `src/services/voiceRouter.js` - GPT-4o-mini intent detection
17. `src/services/groqTTS.js` - TTS client (OpenAI-compatible)
18. `src/services/ragService.js` - Vector database queries
19. `src/services/googleMeet.js` - Google Meet API client

### Hooks (2 files)
20. `src/hooks/useVoiceRecording.js` - Recording state management
21. `src/hooks/useNextelPhone.js` - Phone state (open/closed)

### Data (1 file)
22. `src/data/contextMessages.js` - Rotating ticker messages

### Assets (3 files)
23. `src/assets/sounds/chirp-open.mp3` - Chirp sound on open
24. `src/assets/sounds/chirp-message.mp3` - Chirp on message
25. `src/assets/sounds/chirp-receive.mp3` - Chirp on receive

---

## 🗂️ FILES TO MODIFY (10 existing files)

1. **workers/api.js** - Add 12 new endpoints:
   - POST /api/voice/transcribe
   - POST /api/voice/speak
   - POST /api/voice/upload
   - POST /api/voice/route
   - POST /api/boomer-angs/create-from-voice
   - POST /api/boomer-angs/{id}/execute
   - POST /api/quotes/estimate
   - GET /api/tiers/{userId}
   - POST /api/meetings/google-meet/create
   - POST /api/instructions/save
   - GET /api/insights/daily
   - POST /api/collaboration/invite (update with pricing logic)

2. **supabase/migrations/0006_voice_system.sql** - ✅ CREATED (10 tables, 3 functions, 16 RLS policies)

3. **src/pages/Home.jsx** - Replace chat with Nextel phone

4. **src/pages/Editor.jsx** - Add ContextTicker around Monaco Editor

5. **src/pages/MeetingHub.jsx** - Add Google Meet option (alongside Zoom + Teams)

6. **src/pages/CollaborationProjects.jsx** - Show Plus One pricing

7. **src/pages/Pricing.jsx** - Add FREE tier (below Buy-Me-A-Coffee)

8. **src/pages/AgentBuilder.jsx** - Change builder order to Voice → Type

9. **src/components/Footer.jsx** - Add TerminologyTicker

10. **src/components/Navbar.jsx** - Add voice settings link

---

## 📅 SPRINT SCHEDULE

### PHASE 1: Voice Infrastructure (Days 1-4)

#### Day 1: Groq Whisper Setup
**Morning (4 hours):**
- [ ] Setup Groq API key in CloudFlare Workers secrets
- [ ] Create `src/services/groqWhisper.js` with Whisper v3 API client
- [ ] Create `src/components/VoiceRecorder.jsx` with audio capture
- [ ] Add POST /api/voice/transcribe endpoint in `workers/api.js`

**Afternoon (4 hours):**
- [ ] Implement 10-second minimum billing logic
- [ ] Add fallback chain: Groq → Deepgram → ElevenLabs → OpenAI
- [ ] Test ASR accuracy with sample audio files
- [ ] Create usage_ledger cost tracking

**EOD Checklist:**
- ✅ Voice recording captures audio
- ✅ Transcription returns within 2 seconds
- ✅ Fallback activates if Groq fails
- ✅ Costs tracked in database

---

#### Day 2: Voice Storage + Database
**Morning (4 hours):**
- [ ] Apply migration 0006 to Supabase: `npm run apply-supabase-schema`
- [ ] Create `src/hooks/useVoiceRecording.js` for state management
- [ ] Test voice_profiles table insert/update
- [ ] Test voice_conversations table insert with transcript

**Afternoon (4 hours):**
- [ ] Integrate CloudFlare R2 for audio storage (optional save)
- [ ] Add voice history UI component (last 10 conversations)
- [ ] Test RLS policies (users see only their own conversations)
- [ ] Performance testing (1000 conversations load time)

**EOD Checklist:**
- ✅ Database migration applied successfully
- ✅ Voice data saves to Supabase
- ✅ Audio files upload to R2 (if saved)
- ✅ RLS policies working

---

#### Day 3: Voice NLP Router
**Morning (4 hours):**
- [ ] Create `src/services/voiceRouter.js` with GPT-4o-mini client
- [ ] Add POST /api/voice/route endpoint in `workers/api.js`
- [ ] Map voice commands to agent actions (create, execute, modify, delete)
- [ ] Add confidence scoring (0-100%)

**Afternoon (4 hours):**
- [ ] Create `src/components/VoiceCommandOverlay.jsx` to show detected intent
- [ ] Show manual type selector if confidence < 70%
- [ ] Test routing accuracy with 50+ sample commands
- [ ] Optimize NLP prompt for better accuracy

**EOD Checklist:**
- ✅ 90%+ intent detection accuracy
- ✅ < 500ms routing latency
- ✅ Fallback to manual selection if uncertain
- ✅ User sees detected intent before execution

---

#### Day 4: TTS Integration
**Morning (4 hours):**
- [ ] Research Groq-compatible TTS options (OpenAI TTS as fallback)
- [ ] Create `src/services/groqTTS.js` with TTS client
- [ ] Add POST /api/voice/speak endpoint in `workers/api.js`
- [ ] Test TTS quality (clarity, naturalness, latency)

**Afternoon (4 hours):**
- [ ] Create `src/components/VoicePlayback.jsx` with pause/resume/speed controls
- [ ] Implement toggle: "Read response" vs "Hear response"
- [ ] Add voice playback to chat responses
- [ ] Test voice costs absorbed into tier pricing

**EOD Checklist:**
- ✅ TTS voice sounds natural (not robotic)
- ✅ Response spoken within 3 seconds
- ✅ Toggle between voice/text works instantly
- ✅ Voice costs tracked in usage_ledger

---

### PHASE 2: Nextel Phone UI + Plus One (Days 5-8)

#### Day 5: Large Nextel Phone Component
**Morning (4 hours):**
- [ ] Design large flip phone SVG (black with neon green #39FF14 accents)
- [ ] Create `src/components/NextelPhone.jsx` with flip animation
- [ ] Add open/close state with `src/hooks/useNextelPhone.js`
- [ ] Implement chat window inside phone screen

**Afternoon (4 hours):**
- [ ] Create chirp sound files (chirp-open.mp3, chirp-message.mp3, chirp-receive.mp3)
- [ ] Add sound playback on events (open, send, receive)
- [ ] Add mute toggle for sound effects
- [ ] Test responsive behavior (desktop only for large phone)

**EOD Checklist:**
- ✅ Nextel phone looks authentic (Nothing Brand styled)
- ✅ Flip animation smooth (60fps)
- ✅ Chat window fits naturally inside phone screen
- ✅ Chirp sounds play on key actions

---

#### Day 6: Small Animated Phone (Mobile)
**Morning (4 hours):**
- [ ] Create `src/components/NextelPhoneMini.jsx` for mobile (<768px)
- [ ] Design small animated phone (simplified version)
- [ ] Add pulse animation on message receive
- [ ] Test mobile responsiveness

**Afternoon (4 hours):**
- [ ] Replace chat on `src/pages/Home.jsx` with Nextel phone
- [ ] Add phone toggle icon to Navbar
- [ ] Test phone on multiple screen sizes (mobile, tablet, desktop)
- [ ] Polish animations and transitions

**EOD Checklist:**
- ✅ Small phone works on mobile
- ✅ Large phone shows on desktop
- ✅ Smooth transitions between states
- ✅ No layout shift on phone open/close

---

#### Day 7: Voice Personality System
**Morning (4 hours):**
- [ ] Create voice library (10-15 preset voices)
- [ ] Create `src/components/VoiceSelector.jsx` with voice picker
- [ ] Add voice sample playback (15 second clips)
- [ ] Add GET /api/voice/library endpoint

**Afternoon (4 hours):**
- [ ] Create `src/components/VoiceUploader.jsx` for custom voice upload
- [ ] Add POST /api/voice/upload endpoint
- [ ] Process custom voice for TTS fine-tuning (if supported)
- [ ] Test voice switching (instant apply)

**EOD Checklist:**
- ✅ Voice library loads quickly
- ✅ Voice samples play inline
- ✅ Custom voice upload works (verified audio format)
- ✅ Voice switching takes < 1 second

---

#### Day 8: Plus One Pricing Integration
**Morning (4 hours):**
- [ ] Create `src/components/PlusOnePricing.jsx` with pricing table
- [ ] Display 1-5 member pricing with progressive discounts
- [ ] Create `src/components/CollaboratorInvite.jsx` with cost preview
- [ ] Show "$1/day or save 22% with monthly!" messaging

**Afternoon (4 hours):**
- [ ] Update POST /api/collaboration/invite with pricing logic
- [ ] Add collaboration_billing table inserts
- [ ] Implement daily charge cron job (CloudFlare Workers Cron Trigger)
- [ ] Test billing accuracy (daily vs monthly calculations)

**EOD Checklist:**
- ✅ Pricing table matches specification exactly
- ✅ Cost preview accurate before invite
- ✅ Daily charges deduct correctly
- ✅ Subscription discounts applied properly
- ✅ Max 5 collaborators enforced

---

### PHASE 3: Context Engineering + Polish (Days 9-11)

#### Day 9: Google Meet Integration
**Morning (4 hours):**
- [ ] Install Google Meet SDK or REST API client
- [ ] Setup Google Cloud OAuth credentials
- [ ] Create `src/services/googleMeet.js` API client
- [ ] Add POST /api/meetings/google-meet/create endpoint

**Afternoon (4 hours):**
- [ ] Create `src/components/GoogleMeetButton.jsx`
- [ ] Update `src/pages/MeetingHub.jsx` with Google Meet option
- [ ] Add "Choose Platform" selector (Google Meet | Zoom | Teams)
- [ ] Test meeting creation + joining

**EOD Checklist:**
- ✅ Google Meet meetings create successfully
- ✅ Users can choose preferred platform
- ✅ Meeting links work (verified by joining)

---

#### Day 10: Context Engineering Messaging
**Morning (4 hours):**
- [ ] Create `src/components/ContextTicker.jsx` (ticker around context window)
- [ ] Create `src/data/contextMessages.js` with rotating messages
- [ ] Add "You're not just vibe coding, you're context engineering" message
- [ ] Update `src/pages/Editor.jsx` with ContextTicker

**Afternoon (4 hours):**
- [ ] Create `src/components/TerminologyTicker.jsx` (bottom ticker)
- [ ] Pull user profile from custom_instructions
- [ ] Generate resume-relevant terms based on profile
- [ ] Update `src/components/Footer.jsx` with TerminologyTicker

**EOD Checklist:**
- ✅ Ticker scrolls smoothly (no jank)
- ✅ Messages rotate every 10 seconds
- ✅ Bottom ticker shows user-specific terminology
- ✅ Professional tone maintained

---

#### Day 11: Custom Instructions + RAG + Free Tier
**Morning (4 hours):**
- [ ] Create `src/pages/CustomInstructions.jsx` with profile form
- [ ] Fields: career goals, current role, tech stack, interests, company type
- [ ] Add POST /api/instructions/save endpoint
- [ ] Test form submission + custom_instructions table insert

**Afternoon (4 hours):**
- [ ] Create `src/services/ragService.js` with pgvector queries
- [ ] Implement daily insights algorithm (runs at midnight UTC)
- [ ] Create `src/components/DailyInsights.jsx` with personalized suggestions
- [ ] Add FREE tier to `src/pages/Pricing.jsx` (GROQ only, 2 projects max)
- [ ] Enforce free tier limits in GET /api/tiers/{userId} endpoint
- [ ] Test self-evolving AI integration (Microsoft + Google APIs if available)

**EOD Checklist:**
- ✅ Custom instructions save successfully
- ✅ RAG returns relevant context (verified manually)
- ✅ Daily insights appear in dashboard
- ✅ Free tier limits enforced (GROQ only, 2 projects)
- ✅ Upgrade prompts show when limits hit

---

## 🔧 TECHNICAL SPECIFICATIONS

### Voice Infrastructure

**ASR (Automatic Speech Recognition):**
```javascript
// Primary: Groq Whisper v3
const groqWhisperConfig = {
  provider: 'groq',
  model: 'whisper-v3',
  pricing: {
    perHour: 0.04, // $0.04/hour minimum
    minimumBilling: 10, // 10 seconds minimum
    fallbackCost: 0.111 // $0.111/hour fallback
  },
  fallbacks: ['deepgram', 'elevenlabs', 'openai']
};
```

**TTS (Text-to-Speech):**
```javascript
// OpenAI-compatible (NOT PlayAI)
const ttsConfig = {
  provider: 'openai', // or 'groq-compatible'
  model: 'tts-1', // or 'tts-1-hd'
  voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
  pricing: {
    perCharacter: 0.000015 // $15/1M chars
  }
};
```

**Voice NLP Router:**
```javascript
// Intent detection
const nlpRouterConfig = {
  model: 'gpt-4o-mini', // or 'gpt-4.1-nano' or 'gpt-5-nano'
  intents: [
    'create_agent',
    'execute_task',
    'modify_agent',
    'delete_agent',
    'get_info',
    'help',
    'other'
  ],
  confidenceThreshold: 0.7 // Show manual selector if < 70%
};
```

---

### Plus One Pricing

**Pricing Table:**
```
| Members | Monthly Price | Daily Rate | Discount |
|---------|--------------|------------|----------|
| 1       | $17.99/mo    | $1.00/day  | 0%       |
| 2       | $13.99/mo    | $1.00/day  | 22%      |
| 4       | $10.99/mo    | $1.00/day  | 39%      |
| 5       | $7.99/mo     | $1.00/day  | 56%      |
```

**Subscription Discount Formula:**
```javascript
const calculateSubscriptionDiscount = (memberCount) => {
  const basePricePerMember = 1799; // $17.99 in cents
  
  const discounts = {
    1: 0,    // 0% discount
    2: 22,   // 22% discount
    3: 30,   // 30% discount (interpolated)
    4: 39,   // 39% discount
    5: 56    // 56% discount (max cap)
  };
  
  const discount = discounts[Math.min(memberCount, 5)] || 0;
  const pricePerMember = basePricePerMember * (1 - discount / 100);
  
  return {
    pricePerMember: Math.round(pricePerMember),
    totalPrice: Math.round(pricePerMember * memberCount),
    discount
  };
};
```

---

### Free Tier Limits

```javascript
const freeTierLimits = {
  tier: 'free',
  maxProjects: 2,
  modelsAllowed: ['groq'], // Only GROQ models (G-R-O-Q)
  features: {
    voice: true,
    ocr: false,
    collaboration: false,
    analytics: false
  },
  quotas: {
    monthlyTokens: 100000, // 100k tokens/month
    dailyVoiceMinutes: 10 // 10 minutes voice/day
  }
};
```

---

## 🎨 UI/UX SPECIFICATIONS

### Nextel Phone Design

**Large Phone (Desktop):**
- Dimensions: 300px width × 600px height
- Colors: #000 background, #39FF14 accents (Nothing Brand)
- Flip animation: 0.5s ease-in-out
- Chat window: 280px × 400px (inside phone screen)
- Chirp sound: Play on open (0.3s duration)

**Small Phone (Mobile):**
- Dimensions: 60px width × 120px height
- Position: Fixed bottom-right corner
- Pulse animation: Scale 1.0 → 1.1 → 1.0 (1s loop)
- Expand on tap: Full-screen modal

---

### Context Engineering Ticker

**Context Window Ticker:**
- Position: Around Monaco Editor border
- Direction: Horizontal scroll (right-to-left)
- Speed: 50px/second
- Messages: Rotate every 10 seconds
- Examples:
  - "You're not just vibe coding, you're context engineering"
  - "Your context is your competitive advantage"
  - "Engineering context at scale"

**Terminology Ticker (Bottom):**
- Position: Footer area
- Direction: Horizontal scroll (left-to-right)
- Speed: 30px/second
- Content: User-specific resume terms
- Examples (based on user profile):
  - "Full-Stack Development • API Design • Cloud Infrastructure • CI/CD Automation"
  - "React • Node.js • PostgreSQL • Docker • Kubernetes"

---

## 🚨 RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Groq Whisper API unavailable | HIGH | Fallback chain: Deepgram → ElevenLabs → OpenAI |
| Voice costs too high per tier | MEDIUM | Bundle into tier pricing, show toggle for cost-conscious users |
| Nextel phone UI too complex | MEDIUM | Build simple animated version first, iterate to large phone |
| 8 models insufficient | LOW | Secondary selector loads more on-demand |
| NLP model routing inaccurate | MEDIUM | Manual agent type selection as fallback (confidence < 70%) |

---

## 📈 METRICS TO TRACK

### Voice Metrics
- [ ] Voice input usage rate (% of users using voice)
- [ ] ASR accuracy (% correct transcriptions)
- [ ] NLP routing accuracy (% correct intent detection)
- [ ] TTS playback rate (% of responses played as audio)
- [ ] Average voice cost per user per day

### Plus One Metrics
- [ ] Daily collaboration adds (count)
- [ ] Subscription conversions (daily → monthly)
- [ ] Average collaborators per project
- [ ] Collaboration session duration (minutes)
- [ ] Plus One revenue (daily vs subscription)

### Context Engineering Metrics
- [ ] Custom instructions completion rate (%)
- [ ] Daily insights engagement (viewed, clicked, completed)
- [ ] RAG relevance score (user feedback)
- [ ] Ticker message retention (user surveys)

---

## ✅ DEFINITION OF DONE

**Sprint Complete When:**
1. All 24 new files created ✅
2. All 10 modified files updated ✅
3. Migration 0006 applied to Supabase ✅
4. All 12 API endpoints tested ✅
5. Voice input → transcript → intent → action flow works end-to-end ✅
6. Nextel phone UI deployed (large + small) ✅
7. Plus One pricing shows correct calculations ✅
8. Google Meet integration functional ✅
9. Context engineering tickers visible ✅
10. Free tier limits enforced ✅
11. All success criteria met ✅
12. Manual QA pass ✅
13. Production deployment ready ✅

---

## 🎯 NEXT IMMEDIATE ACTION

1. ✅ **DONE:** Answered all 3 PRD questions
2. ✅ **DONE:** Retrieved Plus One pricing
3. ✅ **DONE:** Created migration 0006
4. ✅ **DONE:** Created sprint implementation plan
5. **NOW:** Apply migration 0006 to Supabase
6. **NEXT:** Create VoiceRecorder.jsx component (Day 1 morning)

---

**Ready to Sprint:** ✅ YES  
**Blockers:** ✅ NONE  
**Let's GO!** 🚀
