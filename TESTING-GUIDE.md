# 🧪 ACHEEVY Testing Guide - Quick Start

## 🎯 What to Test

This guide will help you verify that ACHEEVY AI Assistant and mobile optimizations are working correctly.

---

## ✅ Pre-Flight Checklist

Before testing, ensure:

- [ ] Vite dev server is running (`npm run dev` on port 3000)
- [ ] Cloudflare Worker is running (`npm run worker:dev` on port 8787)
- [ ] You're logged in with Clerk (superadmin recommended for full access)
- [ ] Browser DevTools open (Console + Network tabs)

---

## 🖥️ Desktop Testing

### 1. Access Circuit Box

1. Navigate to `http://localhost:3000/admin`
2. You should see the Circuit Box Dashboard

**Expected:**
- ⚡ Zap icon + "Circuit Box Dashboard" title
- 4 buttons in header: Auto-Configure, ACHEEVY Assistant, All, Active, Inactive
- Grid of breaker cards (3 columns on wide screens)

### 2. Open ACHEEVY Chat

1. Click **"ACHEEVY Assistant"** button (purple, with sparkles icon)
2. Chat modal appears centered on screen

**Expected:**
- Modal with "ACHEEVY Assistant" header
- Welcome message: "Hi! I'm ACHEEVY, your AI assistant"
- Empty chat area with sparkle icon
- Input field at bottom with example suggestions

### 3. Test Intent Detection

**Try these prompts:**

| Prompt | Expected Intent | Expected APIs |
|--------|----------------|---------------|
| "I want to build a voice assistant" | voice-control | OpenAI, Deepgram, ElevenLabs |
| "I need robotics APIs" | robotics | Manus AI, Cloudflare AI |
| "Help me set up AI agents" | agent-building | OpenAI, Anthropic, GitHub, Vercel |
| "I want to edit code" | code-editing | OpenAI, GitHub |
| "Set up ML deployment" | ml-deployment | Cloudflare AI, Modal, Replicate |

**Expected Response:**
- Message appears in chat
- Shows detected intent with confidence %
- Displays suggested services as purple badges
- Contextual guidance based on your tier

### 4. Test Auto-Provisioning

**Try this prompt:**

```
"I want to set up voice control"
```

**Expected:**
1. ACHEEVY detects intent: "voice-control" (high confidence)
2. Because message includes "set up", auto-provisioning triggers
3. Wait ~1 second
4. System message appears: "✓ Auto-configured X services for you!"
5. Circuit Box breaker grid updates in background
6. Navigate back to Circuit Box → breakers should be ON

### 5. Test Manual Orchestration

1. Click **"Auto-Configure"** button
2. Modal appears with use case dropdown

**Try:**
- Select "Voice Assistant"
- Review the services list (OpenAI, Deepgram, etc.)
- Click "Apply Configuration"
- Modal closes, success alert appears
- Breakers update in real-time

---

## 📱 Mobile Testing (Phone)

### Setup

1. Get your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Connect phone to same WiFi
3. Navigate to `http://[YOUR_IP]:3000/admin`

### 1. Responsive Header

**Expected:**
- Title stacks vertically on narrow screen
- Buttons wrap to multiple rows if needed
- "Auto-Configure" → "Configure" (shortened label)
- "ACHEEVY Assistant" → "AI Help" (shortened label)
- Font sizes smaller but readable

### 2. Breaker Grid

**Expected:**
- Single column layout (cards stack vertically)
- Cards fill width with padding
- Touch-friendly tap targets (not too small)
- Toggle switches easy to press

### 3. ACHEEVY Chat on Mobile

**Click "AI Help" button**

**Expected:**
- Modal slides up from bottom of screen (native feel)
- Rounded top corners only
- Full-screen height (90% viewport)
- Chat messages scroll smoothly
- Input field always visible at bottom
- Keyboard pushes input up (not obscured)

**Test typing:**
- Tap input field → keyboard appears
- Type message
- Press "Enter" on keyboard OR tap Send icon
- Message appears immediately
- Keyboard stays open for next message

### 4. Touch Interactions

**Try:**
- Tap breaker card → detail modal slides up from bottom
- Swipe down on modal → doesn't dismiss (must tap X or outside)
- Pinch-to-zoom → disabled (prevented by viewport meta tag)
- Scroll chat → smooth, no rubber-banding issues

---

## 📊 Tablet Testing (iPad, Surface)

### Setup

Same as mobile (use local IP)

### 1. Circuit Box Grid

**Expected:**
- 2-column layout (not 1 or 3)
- Cards proportionally sized
- No weird gaps or overflow

### 2. Modals

**Expected:**
- Centered on screen (not bottom-sliding like mobile)
- Appropriate width (~600px max)
- Rounded all corners
- Padding around edges

---

## 🐛 Debugging

### Common Issues

#### "No ACHEEVY response"

**Check:**
- DevTools Console for errors
- Network tab: Is `/api/admin/circuit-box/orchestrate` endpoint being called?
- Clerk token present in headers?

**Fix:**
- Ensure you're logged in
- Check Worker is running on port 8787

#### "Auto-provisioning doesn't work"

**Requirements:**
- Confidence must be > 70%
- Message must include "set up" or similar trigger
- User must have sufficient tier

**Check:**
- Look at confidence score in chat message
- Try adding "set up" explicitly: "Set up voice control"

#### "Mobile layout broken"

**Check:**
- Viewport meta tag in `index.html`:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ```
- Tailwind breakpoints: `sm:` at 640px, `md:` at 768px
- Browser DevTools → Responsive Design Mode

#### "Breakers don't update after orchestration"

**Check:**
- Network tab: Did `/api/admin/circuit-box` GET request succeed?
- Supabase migrations applied? (Circuit breakers table exists?)
- Worker logs: `wrangler dev` terminal output

**Workaround:**
- Refresh Circuit Box manually
- Check if fallback mock data is being used (look for hardcoded breaker IDs)

---

## 📊 Success Criteria

### ✅ ACHEEVY Chat

- [ ] Opens/closes smoothly
- [ ] Detects intents accurately (>70% confidence on clear prompts)
- [ ] Auto-provisions on "set up" trigger
- [ ] Shows system messages for successful actions
- [ ] Suggests relevant APIs based on intent
- [ ] Conversation history preserved during session

### ✅ Mobile Responsiveness

- [ ] Single-column grid on phones
- [ ] 2-column grid on tablets
- [ ] Modals slide from bottom on mobile
- [ ] Buttons are touch-friendly (44px+ tap targets)
- [ ] No horizontal scrolling
- [ ] Text readable without zooming

### ✅ Circuit Box

- [ ] Breakers toggle on/off
- [ ] Status icons correct (green checkmark, red X, warning triangle)
- [ ] Tier badges display correctly
- [ ] Detail modal shows full info
- [ ] Orchestration applies use cases correctly

---

## 🎉 Advanced Testing

### Multi-User Flow

1. Open incognito window → log in as different user
2. Open Circuit Box
3. Different users should see different breaker states (multi-tenant)

### Tier Limitations

1. Try selecting "Full Platform" use case as Free tier
2. Should show error: "Tier not sufficient"
3. Try with Superior tier → should work

### API Integration

1. Enable "OpenAI LLM" breaker
2. Navigate to `/editor`
3. Test chat with AI
4. Verify OpenAI API is called

---

## 🚀 Next Steps After Testing

1. **Apply Supabase Migrations**
   - Open Supabase dashboard
   - SQL Editor → paste `supabase/migrations/0001_init.sql`
   - Run → paste `0002_policies.sql`
   - Run → verify `circuit_breakers` table exists

2. **Deploy to Production**
   - `npm run build`
   - `wrangler deploy`
   - Test on Cloudflare Pages URL

3. **Monitor Usage**
   - Check Cloudflare Analytics
   - Review Worker logs
   - Track ACHEEVY intent detection accuracy

---

## 📝 Test Log Template

```markdown
# Test Session: [DATE]

## Environment
- Device: [Desktop/iPhone/iPad/Android]
- Browser: [Chrome/Safari/Firefox]
- Screen: [1920x1080 / 375x667 / etc]

## Tests Performed

### ACHEEVY Chat
- [ ] Opens correctly
- [ ] Intent detection: PASS / FAIL
- [ ] Auto-provision: PASS / FAIL
- Notes: ___________

### Mobile UI
- [ ] Responsive grid: PASS / FAIL
- [ ] Touch targets: PASS / FAIL
- [ ] Modals: PASS / FAIL
- Notes: ___________

### Circuit Box
- [ ] Breaker toggles: PASS / FAIL
- [ ] Orchestration: PASS / FAIL
- Notes: ___________

## Issues Found
1. ___________
2. ___________

## Overall: ✅ PASS / ❌ FAIL
```

---

**Happy Testing! 🧪✨**

*If you find issues, check the console first. Most problems are authentication or network-related.*
