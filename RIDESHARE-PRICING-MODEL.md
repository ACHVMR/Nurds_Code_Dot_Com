# Rideshare-Style Collaborative Pricing Model

**Created:** October 31, 2025  
**Status:** Architecture & Implementation Guide  
**Alignment:** Original NURD Platform Collaboration + PRD Plug Ecosystem

---

## 🎯 Core Concept

**Rideshare Pricing for Code Collaboration**

Just like Uber/Lyft let riders split fares, Nurdscode lets developers **split platform costs** when collaborating. The host pays their base tier, and collaborators join for **$1/day** (or prepay for multi-day sessions).

### Key Innovation

- **Solo Mode:** User pays their normal subscription (Free, Coffee, Pro, Superior)
- **Team Mode:** Host activates collaboration → Each +1 costs **$1/day**
- **Split Payment:** Collaborators can chip in OR host covers everyone
- **PiP Activation:** Team mode automatically enables Picture-in-Picture video + shared editor

---

## 💰 Pricing Structure

### Base Tiers (Individual)

| Tier | Solo Price | Features |
|------|-----------|----------|
| **Free** | $0/mo | Solo coding, basic AI, 5 projects |
| **Coffee** | $7/mo | GROQ 70B, voice control, 25 projects |
| **Pro** | $29/mo | GPT-4o mini, OCR, unlimited projects |
| **Superior** | $99/mo | Claude, security scans, team features |

### Collaboration Add-Ons (Rideshare Model)

| Add-On | Price | What It Does |
|--------|-------|--------------|
| **+1 Collaborator** | $1/day | 1 extra person joins session |
| **Prepay 7 Days** | $6 (save $1) | Lock in collaborator for 1 week |
| **Prepay 30 Days** | $20 (save $10) | Lock in collaborator for 1 month |
| **Split Payment** | Divided cost | All participants pay equal share |
| **Team Bundle** | $99/mo | Up to 5 collaborators, unlimited sessions |

### Example Scenarios

#### Scenario 1: Weekend Hackathon
- **Host:** Coffee tier ($7/mo)
- **Needs:** 2 collaborators for Saturday + Sunday
- **Cost:** 2 collaborators × 2 days × $1 = **$4 extra**
- **Payment:** Host pays $4, or splits 3-way ($1.33 each)

#### Scenario 2: Freelance Client Project
- **Host:** Pro tier ($29/mo)
- **Needs:** 1 collaborator for 10 days
- **Cost:** 1 collaborator × 10 days × $1 = **$10 extra**
- **Payment:** Prepay 7 days ($6) + 3 days ($3) = **$9 total**

#### Scenario 3: Startup Team (Ongoing)
- **Host:** Superior tier ($99/mo)
- **Needs:** 4 collaborators, daily for 1 month
- **Cost:** 4 × 30 days × $1 = $120 OR Team Bundle = **$99/mo**
- **Best Option:** Upgrade to Team Bundle (includes 5 collaborators unlimited)

---

## 🚀 Features Activated in Team Mode

### 1. **Picture-in-Picture Collaboration**

When ANY user adds a collaborator:

- **Split-screen layout** (60% editor / 40% video)
- **Real-time cursor tracking** (Y.js CRDT sync)
- **Live code updates** (WebSocket broadcast)
- **Video integration** (Daily.co or Agora SDK)
- **Mobile PiP** (video floats over editor on small screens)

### 2. **Breakaway Rooms** (from Original NURD)

Teams can split into sub-sessions:

- **Main Room:** Full team collaborates on main project
- **Breakaway Room 1:** Frontend team works on UI
- **Breakaway Room 2:** Backend team builds API
- **Merge Back:** Changes sync when rejoining main room

### 3. **Session Persistence**

- **Auto-save** every 30 seconds
- **Session recording** (playback who changed what)
- **Chat history** with timestamps
- **File attachments** (images, videos, docs)

### 4. **Payment Flexibility**

Host chooses payment model:

- **Host Pays All:** "I'll cover everyone"
- **Split Equally:** "Let's divide the cost"
- **Custom Split:** "Designer pays $0.50, I pay $0.50"
- **Prepay Option:** "I'll prepay for the week"

---

## 🗄️ Database Schema

### New Tables

#### `collab_sessions`

```sql
CREATE TABLE collab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  host_id TEXT NOT NULL,
  session_name VARCHAR(255),
  session_token TEXT UNIQUE NOT NULL,
  video_room_url TEXT,
  yjs_doc_id TEXT,
  active_participants INTEGER DEFAULT 1,
  max_participants INTEGER DEFAULT 5,
  pricing_model VARCHAR(50) DEFAULT 'host_pays',
  cost_per_collaborator DECIMAL(10,2) DEFAULT 1.00,
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_collab_sessions_host ON collab_sessions(host_id);
CREATE INDEX idx_collab_sessions_token ON collab_sessions(session_token);
CREATE INDEX idx_collab_sessions_status ON collab_sessions(status);
```

#### `collab_participants`

```sql
CREATE TABLE collab_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'collaborator', -- 'host', 'collaborator', 'viewer'
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  cursor_position JSONB,
  last_activity TIMESTAMP DEFAULT NOW(),
  payment_share DECIMAL(10,2) DEFAULT 1.00,
  payment_status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB
);

CREATE INDEX idx_collab_participants_session ON collab_participants(session_id);
CREATE INDEX idx_collab_participants_user ON collab_participants(user_id);
CREATE INDEX idx_collab_participants_active ON collab_participants(is_active);
```

#### `collab_payments`

```sql
CREATE TABLE collab_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- 'daily', 'prepay_7', 'prepay_30', 'bundle'
  amount DECIMAL(10,2) NOT NULL,
  days_purchased INTEGER DEFAULT 1,
  payment_date TIMESTAMP DEFAULT NOW(),
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  stripe_payment_id TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
  metadata JSONB
);

CREATE INDEX idx_collab_payments_session ON collab_payments(session_id);
CREATE INDEX idx_collab_payments_user ON collab_payments(user_id);
CREATE INDEX idx_collab_payments_status ON collab_payments(status);
```

#### `breakaway_rooms`

```sql
CREATE TABLE breakaway_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  room_name VARCHAR(255),
  room_token TEXT UNIQUE NOT NULL,
  yjs_doc_id TEXT,
  video_room_url TEXT,
  participants INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  merged_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB
);

CREATE INDEX idx_breakaway_rooms_parent ON breakaway_rooms(parent_session_id);
CREATE INDEX idx_breakaway_rooms_status ON breakaway_rooms(status);
```

---

## 🔧 Worker API Endpoints

### 1. **Create Collaboration Session**

```typescript
// POST /api/collab/create
{
  "projectId": "uuid",
  "pricingModel": "host_pays", // or "split_equally", "custom_split"
  "maxParticipants": 5,
  "prepayDays": 0 // 0 = pay-as-you-go, 7 = prepay week, 30 = prepay month
}

// Response
{
  "sessionId": "uuid",
  "sessionToken": "secret-token-abc123",
  "videoRoomUrl": "https://daily.co/nurdscode-xyz",
  "yjsDocId": "yjs-doc-abc123",
  "inviteLink": "https://nurdscode.com/collab/join?token=abc123",
  "cost": {
    "perCollaborator": 1.00,
    "prepayDiscount": 0.00,
    "totalEstimated": 0.00
  }
}
```

### 2. **Join Session**

```typescript
// POST /api/collab/join
{
  "sessionToken": "abc123",
  "userName": "Jane Doe",
  "paymentMethod": "stripe_pm_xxx" // optional if host pays
}

// Response
{
  "participantId": "uuid",
  "sessionDetails": {
    "hostName": "John Doe",
    "projectName": "React Dashboard",
    "activeParticipants": 3,
    "videoRoomUrl": "https://daily.co/nurdscode-xyz"
  },
  "paymentRequired": true,
  "cost": 1.00,
  "paymentStatus": "pending"
}
```

### 3. **Process Payment**

```typescript
// POST /api/collab/payment
{
  "sessionId": "uuid",
  "paymentType": "daily", // or "prepay_7", "prepay_30"
  "stripePaymentMethodId": "pm_xxx"
}

// Response
{
  "paymentId": "uuid",
  "amount": 1.00,
  "validUntil": "2025-11-01T23:59:59Z",
  "status": "completed"
}
```

### 4. **Create Breakaway Room**

```typescript
// POST /api/collab/breakaway
{
  "sessionId": "uuid",
  "roomName": "Frontend Team",
  "participants": ["user-1", "user-2"]
}

// Response
{
  "breakawayId": "uuid",
  "roomToken": "breakaway-xyz",
  "videoRoomUrl": "https://daily.co/nurdscode-breakaway-xyz",
  "yjsDocId": "yjs-breakaway-xyz"
}
```

### 5. **Merge Breakaway Room**

```typescript
// POST /api/collab/breakaway/merge
{
  "breakawayId": "uuid",
  "mergeStrategy": "append" // or "replace", "manual_review"
}

// Response
{
  "mergeStatus": "success",
  "conflicts": [],
  "mergedAt": "2025-10-31T18:30:00Z"
}
```

---

## 💻 Frontend Components

### 1. **CollaborationPanel** (Port from NURD)

```tsx
import React, { useState } from 'react';
import { Users, DollarSign, Video, UserPlus } from 'lucide-react';

export default function CollaborationPanel({ projectId, userPlan }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [pricingModel, setPricingModel] = useState('host_pays');
  const [prepayDays, setPrepayDays] = useState(0);

  const createSession = async () => {
    const res = await fetch('/api/collab/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, pricingModel, maxParticipants: 5, prepayDays })
    });
    const data = await res.json();
    setSessionActive(true);
    // Copy invite link to clipboard
    navigator.clipboard.writeText(data.inviteLink);
  };

  return (
    <div className="bg-zinc-950/95 border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4">Collaboration</h3>
      
      {!sessionActive ? (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Pricing Model</label>
              <select 
                value={pricingModel} 
                onChange={(e) => setPricingModel(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
              >
                <option value="host_pays">I'll pay for everyone ($1/day/person)</option>
                <option value="split_equally">Split cost equally</option>
                <option value="custom_split">Custom split</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Payment Option</label>
              <select 
                value={prepayDays} 
                onChange={(e) => setPrepayDays(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
              >
                <option value={0}>Pay-as-you-go ($1/day)</option>
                <option value={7}>Prepay 7 days ($6 - save $1)</option>
                <option value={30}>Prepay 30 days ($20 - save $10)</option>
              </select>
            </div>

            <button 
              onClick={createSession}
              className="w-full bg-accent text-black font-semibold px-4 py-2 rounded hover:bg-accent/90"
            >
              <UserPlus className="inline w-4 h-4 mr-2" />
              Start Collaboration ($1/collaborator/day)
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Active Collaborators</span>
              <span className="text-accent font-semibold">3/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Today's Cost</span>
              <span className="text-zinc-100 font-semibold">$3.00</span>
            </div>
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              <Video className="inline w-4 h-4 mr-2" />
              Open PiP Video
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### 2. **PiP Video Overlay**

```tsx
import React, { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

export default function PiPVideo({ videoRoomUrl, participants }) {
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 20 });

  return (
    <div 
      className={`fixed z-50 ${minimized ? 'w-64 h-48' : 'w-96 h-72'} bg-black border border-white/20 rounded-lg overflow-hidden shadow-2xl`}
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center justify-between bg-zinc-900 px-3 py-2 border-b border-white/10">
        <span className="text-sm font-semibold">Team Video ({participants.length})</span>
        <div className="flex gap-2">
          <button onClick={() => setMinimized(!minimized)}>
            {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => {}}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <iframe 
        src={videoRoomUrl} 
        className="w-full h-full"
        allow="camera; microphone; display-capture"
      />
    </div>
  );
}
```

---

## 🔄 Collaboration Sync (Y.js Integration)

### WebSocket Handler

```typescript
// src/server/collab-sync.js
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';

const rooms = new Map(); // sessionId -> Y.Doc

export function handleCollabWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws, req) => {
    const sessionId = new URL(req.url, 'http://localhost').searchParams.get('session');
    
    if (!sessionId) {
      ws.close();
      return;
    }

    // Get or create Y.Doc for session
    let yDoc = rooms.get(sessionId);
    if (!yDoc) {
      yDoc = new Y.Doc();
      rooms.set(sessionId, yDoc);
    }

    // Sync updates
    yDoc.on('update', (update) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'yjs-update', update: Array.from(update) }));
        }
      });
    });

    ws.on('message', (message) => {
      const data = JSON.parse(message);
      if (data.type === 'yjs-update') {
        Y.applyUpdate(yDoc, new Uint8Array(data.update));
      }
    });
  });
}
```

### Frontend Y.js Integration

```typescript
// src/services/collab-sync.ts
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function connectToCollabSession(sessionToken: string, onCodeChange: (code: string) => void) {
  const yDoc = new Y.Doc();
  const wsProvider = new WebsocketProvider(
    'ws://localhost:8787/collab/sync',
    sessionToken,
    yDoc
  );

  const yText = yDoc.getText('code');
  
  // Listen for remote changes
  yText.observe(() => {
    onCodeChange(yText.toString());
  });

  // Update from local changes
  const updateCode = (newCode: string) => {
    yText.delete(0, yText.length);
    yText.insert(0, newCode);
  };

  return { yDoc, wsProvider, updateCode };
}
```

---

## 📊 Cost Calculation Logic

### Worker Function

```typescript
// workers/api.js - /api/collab/calculate-cost
if (path === '/api/collab/calculate-cost' && request.method === 'POST') {
  const { collaborators, days, pricingModel, prepayDays } = await request.json();

  let costPerDay = collaborators * 1.00; // $1 per collaborator per day
  let totalCost = costPerDay * days;

  // Apply prepay discounts
  if (prepayDays === 7) {
    totalCost = collaborators * 6.00; // Save $1
  } else if (prepayDays === 30) {
    totalCost = collaborators * 20.00; // Save $10
  }

  // Split payment
  let perPersonCost = totalCost;
  if (pricingModel === 'split_equally') {
    perPersonCost = totalCost / (collaborators + 1); // +1 for host
  }

  return new Response(JSON.stringify({
    totalCost,
    perPersonCost,
    costPerDay,
    savings: (collaborators * days * 1.00) - totalCost,
    prepayDiscount: prepayDays > 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
```

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| **Collaboration Adoption** | 40% of paid users activate team mode |
| **Average Collaborators** | 2.5 per session |
| **Session Duration** | 3+ hours average |
| **Prepay Rate** | 60% choose prepay vs. daily |
| **Split Payment Usage** | 30% of sessions split costs |
| **PiP Video Usage** | 80% enable video during sessions |
| **Breakaway Room Usage** | 25% of teams use breakaway rooms |

---

## 🚀 Implementation Roadmap

### Week 1: Database + API Foundation
- [ ] Create Supabase tables (collab_sessions, collab_participants, collab_payments, breakaway_rooms)
- [ ] Add Worker endpoints (/api/collab/create, /api/collab/join, /api/collab/payment)
- [ ] Integrate Stripe for $1 daily payments
- [ ] Build cost calculation logic

### Week 2: Real-Time Sync
- [ ] Integrate Y.js for code synchronization
- [ ] Set up WebSocket server for collab-sync
- [ ] Add cursor tracking with Awareness protocol
- [ ] Test multi-user editing

### Week 3: Video Integration
- [ ] Integrate Daily.co or Agora SDK
- [ ] Build PiP video component
- [ ] Add split-screen layout (60/40)
- [ ] Mobile PiP mode

### Week 4: Payment Flow
- [ ] Build pricing selector UI
- [ ] Add Stripe checkout for collaborators
- [ ] Implement prepay discounts (7/30 days)
- [ ] Split payment calculation

### Week 5: Breakaway Rooms
- [ ] Port breakaway room logic from NURD
- [ ] Create sub-session management
- [ ] Build merge conflict resolution
- [ ] Test room switching

### Week 6: Polish & Launch
- [ ] User testing (5-person team sessions)
- [ ] Performance optimization (WebSocket scaling)
- [ ] Documentation & help guides
- [ ] Public launch

---

## 📖 Related Documentation

- **Original NURD Collaboration:** [GitHub Repo](https://github.com/BoomerAng9/NURD) - `collaboration-panel.tsx`, `collaboration-service.ts`
- **PRD Plug Ecosystem:** `PRD-PLUG-ECOSYSTEM.md` - Picture-in-picture specs (page 45-50)
- **ChatWidget Integration:** `CHATWIDGET-INTEGRATION.md` - Team brainstorming → coding
- **Supabase Schema:** `supabase/migrations/` - Extend with collab tables

---

## 💡 Key Differentiators

### vs. Replit Multiplayer
- **Cheaper:** $1/day vs. $20/user/month
- **Flexible:** Pay-as-you-go vs. forced monthly

### vs. CodeSandbox Team
- **Simpler:** No seat management, just +1 buttons
- **Fair:** Split costs equally or custom

### vs. GitHub Codespaces
- **Video Built-In:** PiP collaboration, not separate Zoom
- **Rideshare UX:** Familiar "add passenger" model

---

**Bottom Line:** Nurdscode is the **first AI coding platform with rideshare pricing** for collaboration. Pay $1/day per collaborator, split costs fairly, and get built-in video + real-time sync. No forced subscriptions, no seat minimums.

**Think it. Prompt it. Build it. Together.** 🚀
