# Quick Smoke Test: ChatWidget → Teleport → Editor

## Setup & Prerequisites
✅ ChatWidget component created (src/components/ChatWidget.jsx)
✅ Teleport functionality integrated (send idea prompt to Editor)
✅ NURD logo added to Navbar (public/nurd-drip-logo.svg)
✅ Voice model switching in Editor (OpenAI/Deepgram/ElevenLabs)
✅ Supabase migrations (0001_init.sql, 0002_policies.sql, 0003_collab_rideshare.sql, 0004_clerk_difu_ledger.sql)
✅ DIFU ledger schema ready for digital currency tracking

## Test Steps (Manual)

### Step 1: Start Dev Server
```bash
npm run dev
# Should open http://localhost:3000
npm run worker:dev  
# Cloudflare Worker API on http://localhost:8787
```

### Step 2: Test ChatWidget Visibility
- Navigate to http://localhost:3000
- Look for **chat bubble** in bottom-right corner
- Should show: 💬 icon, initially collapsed
- Click bubble to open chat widget

### Step 3: Send Message to ACHEEVY
- In expanded ChatWidget, enter message: "I want to build a real-time collaboration tool"
- Click Send button or press Enter
- Should see:
  - User message appears in chat
  - Loading spinner shows
  - API call to /api/chat endpoint
  - ACHEEVY response appears in widget

### Step 4: Test Teleport Functionality
- Look for **Teleport Button** in ChatWidget footer
- Button should be available when chat has an idea
- Click "Teleport to Editor" button
- Expected behavior:
  - ChatWidget closes
  - Navigation to /editor page
  - Editor page loads with idea pre-filled in assistant input
  - Chat history preserved

### Step 5: Verify Editor State
- Confirm URL is now http://localhost:3000/editor
- Confirm assistant input textarea contains teleported idea
- Try asking a follow-up question to ACHEEVY
- Voice button (🎙️) should be visible
- Voice model dropdown shows: OpenAI Whisper, Deepgram, ElevenLabs

### Step 6: Test Voice Model Switching
- In Editor, click dropdown next to "🎙️ Voice Assistant"
- Select "Deepgram" or "ElevenLabs"
- Should switch provider without errors
- Try "Start Listening" button
- Browser should request microphone permission

## Expected Results

✅ **ChatWidget opens/closes**: Modal dialog appears/disappears smoothly
✅ **Message sends**: "Send" button works, loading indicator shows
✅ **ACHEEVY responds**: Response from LLM appears in chat
✅ **Teleport works**: Editor page opens with idea pre-filled
✅ **Voice works**: Provider dropdown changes, voices load
✅ **localStorage persists**: Refresh page, chat history remains
✅ **Navigation preserves state**: Can navigate back/forward without losing context

## Common Issues & Fixes

### Issue: ChatWidget doesn't appear
- Check browser console for errors
- Verify ChatWidget imported in App.jsx
- Check if localStorage is available (not in private browsing)

### Issue: Teleport button disabled/missing
- Ensure chat has at least one message
- Check if button has class `disabled`
- Verify react-router-dom useNavigate hook works

### Issue: API error when sending message
- Check VITE_API_URL environment variable
- Verify worker:dev is running on port 8787
- Check /api/chat endpoint exists
- Look for CORS headers in response

### Issue: Voice not working
- Ensure VITE_OPENAI_API_KEY is set in .env
- Check browser permissions for microphone
- Try different browser (Chrome/Edge better than Safari)
- Check browser console for WebAudio errors

## Next Steps After Passing Tests

1. **Deploy to production**: `npm run build && npm run deploy`
2. **Test with real users**: Share staging URL
3. **Implement Plus 1 Team Plan**: See PLUS-1-TEAM-PLAN.md
4. **Enable Clerk authentication**: 
   - Verify VITE_CLERK_PUBLISHABLE_KEY is set
   - Test sign-in/sign-up flows
   - Create test users

## Performance Baseline

- ChatWidget open/close: < 200ms
- Message send: < 2s (API latency dependent)
- Teleport navigation: < 500ms
- Voice provider switch: < 1s
- Page load: < 3s (including LLM warmup)

## Metrics to Track

- Chat messages per session
- Teleport conversion rate (messages → editor)
- Voice feature adoption
- Error rate on API calls
- Browser compatibility (Chrome/Edge/Firefox)

---

**Test Date**: 2025-10-31
**Tested By**: QA Team
**Status**: ✅ Ready for smoke test
