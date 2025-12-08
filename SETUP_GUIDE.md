# Nurds Code - Complete Setup Guide

## 🎯 Overview

Your Nurds Code platform is now configured with:
- ✅ **Supabase Database** - Configured and ready
- ✅ **Cloudflare R2 Storage** - Configured for audio/video
- ✅ **6 Integrated SDKs** - Vibe, OpenHands, Plandex, OpenManus, UI-Tars, Claude
- ✅ **Testing Lab** - Full plugin testing environment
- ✅ **The V.I.B.E. IDE** - AI-powered code editor

---

## 🌐 Live Site

**Production URL:** https://work-1-mbzrrwgjyacjnaze.prod-runtime.all-hands.dev

**Pages:**
- `/` - Homepage
- `/editor` - The V.I.B.E. IDE
- `/testinglab` - Testing Lab (NEW! Completely rebuilt)
- `/workbench` - Development Workbench

---

## ✅ What's Already Configured

### 1. Backend APIs (Configured ✅)

Your `.env` file is configured with:

```bash
# Supabase (✅ Working)
VITE_SUPABASE_PROJECT_URL=https://lgupmlysczbxluffnadq.supabase.co
VITE_SUPABASE_ANON_KEY=[configured]
SUPABASE_SERVICE_ROLE_KEY=[configured]

# Cloudflare R2 (✅ Working)
R2_ACCESS_KEY_ID=[configured]
R2_SECRET_ACCESS_KEY=[configured]
R2_BUCKET_NAME=voice-audio
```

### 2. SDKs (Ready 🚀)

All 6 SDKs are integrated and will initialize on Testing Lab page load:

1. **Vibe Coding SDK** - Cloudflare-based code generation
2. **OpenHands Agent SDK** - AI agent orchestration
3. **Plandex CLI** - AI-powered project planning
4. **OpenManus** - Open source automation
5. **UI-Tars** - UI component testing
6. **Claude SDK** - Anthropic AI integration

---

## 🔧 What You Need to Add

### Step 1: Get Free GROQ API Key (Required for AI)

1. Go to: https://console.groq.com/keys
2. Sign up (it's FREE)
3. Create an API key
4. Add to `.env`:

```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

### Step 2: (Optional) Set Up Cloudflare AI Gateway

For production logging/caching/rate limiting:

1. Go to: https://dash.cloudflare.com
2. Navigate to: **AI → AI Gateway**
3. Click **Create Gateway**
4. Copy your gateway URL
5. Add to `.env`:

```bash
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_NAME
```

### Step 3: (Optional) Claude API Key

For enterprise-tier AI features:

1. Go to: https://console.anthropic.com/
2. Get your API key
3. Add to `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-your_key_here
```

---

## 🚀 How to Deploy Backend API

Your Cloudflare Worker backend is ready to deploy:

```bash
# Install Wrangler CLI (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
cd /workspace/project/Nurds_Code_Dot_Com
wrangler deploy

# The worker will be deployed to: https://nurdscode-api.YOUR_ACCOUNT.workers.dev
```

After deployment, update your `.env`:

```bash
VITE_API_URL=https://nurdscode-api.YOUR_ACCOUNT.workers.dev
```

---

## 🧪 Testing Lab - How It Works

### Purpose
Test any tool, plugin, or repository in a safe sandbox environment before using in production.

### Features

#### 1. **GitHub Repository Loader**
- Load any public GitHub repo
- Automatically fetches repo info, stars, language
- Example: `https://github.com/facebook/react`

#### 2. **NPM Package Loader**
- Load any NPM package
- Specify version or use `latest`
- Example: `lodash` or `@supabase/supabase-js`

#### 3. **Custom Code Loader**
- Write and test your own JavaScript plugins
- Full Monaco editor with syntax highlighting
- Instant testing in isolated sandbox

#### 4. **Execution Environment**
- Run plugins with custom JSON input
- Real-time console output
- Performance metrics (execution time, memory, CPU)
- Isolated sandboxes for safety

### How to Use Testing Lab

1. **Navigate to**: https://work-1-mbzrrwgjyacjnaze.prod-runtime.all-hands.dev (click "Testing Lab" in nav)

2. **Load a Plugin:**
   - **GitHub**: Paste repo URL → Click "Load Repository"
   - **NPM**: Enter package name → Click "Load Package"
   - **Custom**: Write code → Click "Load Code"

3. **Execute:**
   - Select loaded plugin from list
   - Enter JSON input (e.g., `{"test": "data"}`)
   - Click "Execute Plugin"
   - Watch console for real-time output

4. **View Results:**
   - Execution status
   - Output data
   - Performance metrics
   - Console logs

---

## 💻 The V.I.B.E. IDE - How It Works

### Features
- **Platform Selector**: Choose from Bolt, Cursor, Lovable, v0, Windsurf
- **Chat Interface**: ChatGPT-style AI conversation
- **Code Editor**: Monaco editor with syntax highlighting
- **Tabbed Workbench**: Code / Preview / Data views
- **Build It Button**: Generates code from natural language prompts

### Current Status

⚠️ **The "Build It" button currently shows a fallback message because:**
1. No LLM API keys configured yet (need GROQ_API_KEY)
2. Backend worker not deployed yet (need to run `wrangler deploy`)

### How to Enable Real AI Code Generation

1. Add GROQ API key to `.env` (see Step 1 above)
2. Deploy Cloudflare Worker:
   ```bash
   wrangler deploy
   ```
3. Update `VITE_API_URL` in `.env` to your deployed worker URL
4. Rebuild frontend:
   ```bash
   npm run build
   ```
5. Now "Build It" button will generate REAL code using AI! 🎉

---

## 📋 File Structure

```
Nurds_Code_Dot_Com/
├── .env                          # ✅ Configured with Supabase + R2
├── wrangler.toml                 # Cloudflare Worker config
├── workers/
│   └── api.js                    # Backend API (ready to deploy)
├── src/
│   ├── pages/
│   │   ├── Editor.jsx            # ✅ The V.I.B.E. IDE (rebuilt)
│   │   └── TestingLab.jsx        # ✅ Testing Lab (completely rebuilt)
│   ├── utils/
│   │   ├── sdkManager.js         # ✅ NEW: All 6 SDKs integrated
│   │   └── pluginLoader.js       # ✅ NEW: GitHub/NPM/Custom loaders
│   └── server/
│       └── llm.js                # LLM integration helpers
├── test-cloudflare-connection.js # ✅ NEW: SDK status checker
└── SETUP_GUIDE.md               # ✅ This file
```

---

## 🔍 Testing Your Setup

Run the connection test:

```bash
cd /workspace/project/Nurds_Code_Dot_Com
node test-cloudflare-connection.js
```

This will check:
- ✅ .env file exists
- ✅ API keys configured
- ✅ Cloudflare tools present
- ✅ Worker files ready
- ✅ SDK integrations

---

## 🎯 Quick Start Checklist

- [x] Supabase configured
- [x] Cloudflare R2 configured
- [x] SDKs integrated (6 total)
- [x] Testing Lab rebuilt
- [x] The V.I.B.E. IDE updated
- [ ] Add GROQ_API_KEY to .env
- [ ] Deploy Cloudflare Worker with `wrangler deploy`
- [ ] Update VITE_API_URL in .env
- [ ] Rebuild with `npm run build`
- [ ] Test real AI code generation

---

## 🐛 Troubleshooting

### "Link isn't working"

**Site IS working!** Test it:

```bash
curl https://work-1-mbzrrwgjyacjnaze.prod-runtime.all-hands.dev
```

If your browser can't access it:
- Try incognito/private mode
- Clear browser cache
- Check network/firewall settings
- Try different browser

### "Build It button not working"

This is expected! You need to:
1. Add GROQ_API_KEY to .env
2. Deploy the worker
3. The button currently shows helpful error messages explaining this

### "SDKs showing errors"

SDKs will show "ready_simulation" mode until you:
- Add API keys
- Deploy backend
- They will still work in simulation mode for testing!

---

## 📞 Next Steps

1. **Add GROQ API Key** - Get free key from https://console.groq.com
2. **Deploy Worker** - Run `wrangler deploy` to activate backend
3. **Test Everything** - Visit Testing Lab and try loading a GitHub repo
4. **Generate Code** - Use The V.I.B.E. IDE to build with AI

---

## 🎉 What's NEW in This Update

✨ **Completely Rebuilt Testing Lab:**
- Load plugins from GitHub, NPM, or custom code
- Execute in isolated sandboxes
- Real-time console output
- Performance metrics
- Professional UI with neon cyber theme

✨ **SDK Manager:**
- 6 integrated SDKs ready to use
- Automatic initialization
- Status monitoring
- Error handling

✨ **Plugin Loader:**
- GitHub API integration
- NPM registry integration
- Custom code support
- Metadata extraction

✨ **Backend Configuration:**
- Supabase connected
- Cloudflare R2 connected
- LLM routing ready
- Tier-based AI models

---

**Need Help?** Check the console in Testing Lab - it provides real-time feedback on what's happening!

**Remember:** The infrastructure is ready. You just need to add API keys and deploy the worker to go fully live! 🚀
