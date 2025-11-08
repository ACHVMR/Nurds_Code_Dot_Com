# 🧩 MICROSOFT FABRIC + TEAMS + ZOOM INTEGRATION
**NURDSCODE Analytics & Collaboration Enhancement**  
**Version 1.0 | November 2, 2025**

---

## 🎯 OBJECTIVE

Integrate Microsoft Fabric as the analytics and AI backbone for Nurdscode, with Microsoft Teams and Zoom serving as collaboration bridges.

**Mantra**: "Think It. Prompt It. Let's Build It."

---

## 📊 TIER-BASED ACCESS MODEL

| Tier | Price | Fabric Access | Collaboration | Recording |
|------|-------|---------------|---------------|-----------|
| **Free** | $0 | Read-only dashboards | Join Zoom community calls | No |
| **Pro** | $29.99/mo | Interactive dashboards + AI Copilot | Host private Zoom sessions | 30 days |
| **Enterprise** | $5,000/mo | Full Fabric workspace + OneLake | Teams + Zoom (host + record + archive) | Unlimited |

---

## 🏗️ ARCHITECTURE STACK

### Existing Foundation
```
Frontend: React + Vite + Nothing Brand
Auth: Clerk + Supabase RLS
Database: Supabase (PostgreSQL)
AI: Groq + CloudFlare AI
Security: Shufti Pro + CloudFlare Zero Trust
```

### New Integrations
```
Analytics: Microsoft Fabric (Power BI + OneLake + Synapse)
Collaboration: Teams JS SDK v2.0 + Zoom Video SDK
Identity: Azure Entra ID (federated via Clerk)
Compliance: Fabric Purview
AI Enhancement: Fabric Copilot (Azure OpenAI)
```

---

## 🔗 DATA FLOW ARCHITECTURE

```
┌─────────────┐
│  Supabase   │ (User data, sessions, analytics)
└──────┬──────┘
       │
       ↓ (Azure Data Factory Pipeline)
┌──────────────────┐
│ Fabric OneLake   │ (Delta Lake storage)
└────────┬─────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────────┐
│Synapse │ │ Power BI │
└────────┘ └─────┬────┘
                 │
                 ↓ (Power BI Embedded API)
         ┌───────────────┐
         │ Nurdscode UI  │
         │ /analytics    │
         └───────────────┘
```

### Collaboration Flow
```
Clerk Auth → Azure Entra SSO → Teams/Zoom API
                    ↓
        ┌───────────┴──────────┐
        ↓                      ↓
  Teams SDK                Zoom SDK
        ↓                      ↓
  Meeting Link           Video Session
        ↓                      ↓
    Metadata → Supabase → Fabric Analytics
```

---

## 📦 PHASE 1: MICROSOFT FABRIC SETUP

### Step 1.1: Create Fabric Workspace
```bash
# Install Azure CLI
az login
az extension add --name fabric

# Create workspaces per tier
az fabric workspace create --name "nurdscode-free" --sku F2
az fabric workspace create --name "nurdscode-pro" --sku F64
az fabric workspace create --name "nurdscode-enterprise" --sku F1024

# Create OneLake capacity
az fabric capacity create --name "nurdscode-onelake" --sku F64
```

### Step 1.2: Azure Data Factory Pipeline
```json
{
  "name": "supabase-to-fabric-sync",
  "properties": {
    "activities": [
      {
        "name": "CopySupabaseToOneLake",
        "type": "Copy",
        "inputs": [
          {
            "referenceName": "SupabasePostgres",
            "type": "DatasetReference"
          }
        ],
        "outputs": [
          {
            "referenceName": "FabricOneLake",
            "type": "DatasetReference"
          }
        ],
        "typeProperties": {
          "source": {
            "type": "PostgreSqlSource",
            "query": "SELECT * FROM analytics_events WHERE created_at > @{pipeline().parameters.lastSync}"
          },
          "sink": {
            "type": "ParquetSink",
            "storeSettings": {
              "type": "AzureBlobFSWriteSettings"
            }
          }
        }
      }
    ],
    "parameters": {
      "lastSync": {
        "type": "string"
      }
    }
  }
}
```

### Step 1.3: Power BI Datasets
```sql
-- Create views in Supabase for Fabric sync
CREATE VIEW analytics_usage AS
SELECT 
  user_id,
  COUNT(*) as session_count,
  SUM(duration_minutes) as total_minutes,
  DATE_TRUNC('day', created_at) as date
FROM collaboration_sessions
GROUP BY user_id, DATE_TRUNC('day', created_at);

CREATE VIEW analytics_sales AS
SELECT 
  user_id,
  SUM(amount_usd) as total_revenue,
  COUNT(*) as transaction_count,
  DATE_TRUNC('month', created_at) as month
FROM collaboration_invoices
WHERE status = 'paid'
GROUP BY user_id, DATE_TRUNC('month', created_at);

CREATE VIEW analytics_engagement AS
SELECT 
  project_id,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as activity_count,
  action,
  DATE_TRUNC('day', created_at) as date
FROM collaboration_activity_log
GROUP BY project_id, action, DATE_TRUNC('day', created_at);
```

---

## 📦 PHASE 2: POWER BI EMBEDDED INTEGRATION

### Step 2.1: Azure App Registration
```bash
# Register app for Power BI Embedded
az ad app create --display-name "Nurdscode-PowerBI-Embed" \
  --required-resource-accesses '[{
    "resourceAppId": "00000009-0000-0000-c000-000000000000",
    "resourceAccess": [{
      "id": "4ae1bf56-f562-4747-b7bc-2fa0874ed46f",
      "type": "Scope"
    }]
  }]'

# Get credentials
APP_ID=$(az ad app list --display-name "Nurdscode-PowerBI-Embed" --query "[0].appId" -o tsv)
az ad app credential reset --id $APP_ID
```

### Step 2.2: Power BI Embed Token Generator (Worker)
```javascript
// In workers/api.js - Add this endpoint

// Generate Power BI embed token
if (path === '/api/analytics/embed-token' && request.method === 'POST') {
  try {
    const { userId } = await request.json();
    
    // Get user tier from Supabase
    const userResult = await supabase
      .from('users')
      .select('tier')
      .eq('clerk_id', userId)
      .single();
    
    const tier = userResult.data?.tier || 'free';
    
    // Map tier to workspace
    const workspaceMap = {
      free: env.FABRIC_WORKSPACE_FREE,
      pro: env.FABRIC_WORKSPACE_PRO,
      enterprise: env.FABRIC_WORKSPACE_ENTERPRISE
    };
    
    const workspaceId = workspaceMap[tier];
    
    // Get Azure AD token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.AZURE_CLIENT_ID,
          client_secret: env.AZURE_CLIENT_SECRET,
          scope: 'https://analysis.windows.net/powerbi/api/.default',
          grant_type: 'client_credentials'
        })
      }
    );
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Generate embed token
    const embedResponse = await fetch(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${env.FABRIC_REPORT_ID}/GenerateToken`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessLevel: tier === 'free' ? 'View' : 'Edit',
          identities: [{
            username: userId,
            roles: [tier],
            datasets: [env.FABRIC_DATASET_ID]
          }]
        })
      }
    );
    
    const embedData = await embedResponse.json();
    
    return new Response(
      JSON.stringify({
        token: embedData.token,
        tokenId: embedData.tokenId,
        expiration: embedData.expiration,
        reportId: env.FABRIC_REPORT_ID,
        embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${env.FABRIC_REPORT_ID}&groupId=${workspaceId}`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate embed token: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
```

---

## 📦 PHASE 3: MICROSOFT TEAMS INTEGRATION

### Step 3.1: Teams App Manifest
```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
  "manifestVersion": "1.16",
  "version": "1.0.0",
  "id": "nurdscode-teams-app",
  "packageName": "com.nurdscode.teams",
  "developer": {
    "name": "NURDSCODE by ACHEEVY",
    "websiteUrl": "https://nurdscode.com",
    "privacyUrl": "https://nurdscode.com/privacy",
    "termsOfUseUrl": "https://nurdscode.com/terms"
  },
  "name": {
    "short": "NURDSCODE",
    "full": "NURDSCODE Analytics & Collaboration"
  },
  "description": {
    "short": "AI-powered analytics and collaboration",
    "full": "Integrate your NURDSCODE workspace with Microsoft Teams"
  },
  "icons": {
    "color": "nurd-drip-logo.svg",
    "outline": "nurd-drip-logo.svg"
  },
  "accentColor": "#39FF14",
  "configurableTabs": [
    {
      "configurationUrl": "https://nurdscode.com/teams/config",
      "canUpdateConfiguration": true,
      "scopes": ["team", "groupchat"]
    }
  ],
  "permissions": [
    "identity",
    "messageTeamMembers"
  ],
  "validDomains": [
    "nurdscode.com",
    "*.nurdscode.com"
  ]
}
```

### Step 3.2: Teams SDK Integration (React Component)
```javascript
// Will create: src/components/TeamsIntegration.jsx
// This component handles Teams meeting creation and join
```

---

## 📦 PHASE 4: ZOOM INTEGRATION

### Step 4.1: Zoom App Configuration
```bash
# In Zoom Marketplace, create app with:
# - Video SDK credentials
# - Meeting SDK credentials
# - Webhook subscriptions (meeting.started, meeting.ended)
```

### Step 4.2: Zoom Token Generator (Worker)
```javascript
// In workers/api.js - Add this endpoint

// Generate Zoom SDK token
if (path === '/api/zoom/sdk-token' && request.method === 'POST') {
  try {
    const { userId, meetingNumber, role } = await request.json();
    
    // Verify user tier (Pro+ can host)
    const userResult = await supabase
      .from('users')
      .select('tier, verified')
      .eq('clerk_id', userId)
      .single();
    
    const tier = userResult.data?.tier || 'free';
    const verified = userResult.data?.verified || false;
    
    if (role === 'host' && (tier === 'free' || !verified)) {
      return new Response(
        JSON.stringify({ error: 'Pro tier and verification required to host meetings' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate JWT token for Zoom SDK
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 2; // 2 hours
    
    const payload = {
      appKey: env.ZOOM_SDK_KEY,
      iat,
      exp,
      tokenExp: exp
    };
    
    // Sign with Zoom SDK secret
    const token = await generateZoomToken(payload, env.ZOOM_SDK_SECRET);
    
    // Log meeting creation
    await supabase.from('meeting_logs').insert({
      user_id: userId,
      meeting_number: meetingNumber,
      platform: 'zoom',
      role,
      started_at: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        token,
        meetingNumber,
        userName: userId,
        passWord: '' // Optional password
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate Zoom token: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
```

---

## 📦 ENVIRONMENT VARIABLES REQUIRED

### Add to wrangler.toml:
```toml
[vars]
# Microsoft Fabric / Power BI
AZURE_TENANT_ID = "your-tenant-id"
AZURE_CLIENT_ID = "your-app-client-id"
FABRIC_WORKSPACE_FREE = "workspace-id-free"
FABRIC_WORKSPACE_PRO = "workspace-id-pro"
FABRIC_WORKSPACE_ENTERPRISE = "workspace-id-enterprise"
FABRIC_REPORT_ID = "your-report-id"
FABRIC_DATASET_ID = "your-dataset-id"

# Microsoft Teams
TEAMS_APP_ID = "your-teams-app-id"
GRAPH_API_ENDPOINT = "https://graph.microsoft.com/v1.0"

# Zoom
ZOOM_SDK_KEY = "your-zoom-sdk-key"
ZOOM_API_KEY = "your-zoom-api-key"
ZOOM_WEBHOOK_SECRET = "your-webhook-secret"

[secrets]
# Run: npx wrangler secret put <KEY_NAME>
# AZURE_CLIENT_SECRET
# ZOOM_SDK_SECRET
# ZOOM_API_SECRET
```

---

## 📦 DATABASE SCHEMA ADDITIONS

```sql
-- Add tier column to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise'));

-- Meeting logs table
CREATE TABLE IF NOT EXISTS meeting_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  meeting_number TEXT,
  meeting_id TEXT,
  platform TEXT CHECK (platform IN ('teams', 'zoom')),
  role TEXT CHECK (role IN ('host', 'participant')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INT,
  participants_count INT,
  recording_url TEXT,
  transcript_url TEXT,
  metadata JSONB
);

CREATE INDEX idx_meeting_logs_user ON meeting_logs(user_id);
CREATE INDEX idx_meeting_logs_started ON meeting_logs(started_at DESC);

-- Analytics sync status
CREATE TABLE IF NOT EXISTS fabric_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'usage', 'sales', 'engagement'
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  records_synced INT,
  error_message TEXT
);

-- Power BI embed tokens cache
CREATE TABLE IF NOT EXISTS powerbi_embed_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  token_id TEXT,
  report_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_powerbi_tokens_user ON powerbi_embed_tokens(user_id);
CREATE INDEX idx_powerbi_tokens_expires ON powerbi_embed_tokens(expires_at);
```

---

## 🎯 IMPLEMENTATION PRIORITIES

### Week 1: Foundation
- [ ] Azure Fabric workspace setup
- [ ] Azure Data Factory pipeline creation
- [ ] Power BI dataset design
- [ ] Supabase analytics views
- [ ] Database schema migration

### Week 2: Power BI Embedding
- [ ] Azure app registration
- [ ] Embed token API endpoint
- [ ] Analytics page React component
- [ ] Tier-based dashboard logic
- [ ] Nothing Brand styling

### Week 3: Teams Integration
- [ ] Teams app manifest
- [ ] Azure Entra SSO setup
- [ ] Teams SDK component
- [ ] Meeting creation API
- [ ] Graph API integration

### Week 4: Zoom Integration
- [ ] Zoom app setup
- [ ] SDK token generation
- [ ] Video component
- [ ] Host/join logic
- [ ] Webhook handlers

### Week 5: Testing & Polish
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Beta rollout

---

## 📊 SUCCESS METRICS

- **Analytics Adoption**: 60%+ of Pro users view dashboards weekly
- **Meeting Usage**: 40%+ of Enterprise users host meetings monthly
- **Data Sync**: 99.9% uptime for Fabric pipeline
- **Embed Performance**: <2s dashboard load time
- **User Satisfaction**: 4.5+ star rating for analytics features

---

**Status**: 📋 READY FOR IMPLEMENTATION  
**Next**: Create React components + API endpoints  
**Timeline**: 5 weeks to full production
