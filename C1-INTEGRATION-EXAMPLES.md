# C1 THESYS QUICK INTEGRATION EXAMPLES

## 🎯 Replace Existing UI with C1 Cards - Real Examples

---

## Example 1: Agent Builder Page - Show Agent Performance

### BEFORE (Plain Text):
```jsx
// AgentBuilder.jsx
<div className="agent-info">
  <h3>{agent.name}</h3>
  <p>Status: {agent.status}</p>
  <p>Tasks: {agent.tasksCompleted}</p>
  <p>Success Rate: {agent.successRate}%</p>
  <p>Tokens: {agent.tokensUsed}</p>
</div>
```

### AFTER (C1 Card):
```jsx
// AgentBuilder.jsx
import { C1AgentCard } from '@/components/C1Card';

<C1AgentCard agent={{
  name: agent.name,
  status: agent.status,
  tasksCompleted: agent.tasksCompleted,
  successRate: agent.successRate,
  tokensUsed: agent.tokensUsed,
  effectivenessLevel: agent.effectivenessLevel
}} />
```

**Result:** Beautiful card with progress bars, status indicators, and golden yellow theme!

---

## Example 2: Editor Page - Show Build Progress

### BEFORE (Console/Text):
```jsx
// Editor.jsx
{building && (
  <div>
    <p>Building... {buildProgress}%</p>
    <p>Time elapsed: {elapsed}</p>
  </div>
)}
```

### AFTER (C1 Card):
```jsx
// Editor.jsx
import { C1ProgressCard } from '@/components/C1Card';

{building && (
  <C1ProgressCard progress={{
    task: 'Building Application',
    status: 'In Progress',
    percent: buildProgress,
    elapsed: elapsed,
    remaining: estimatedRemaining,
    currentStep: currentStep,
    totalSteps: 6,
    operation: currentOperation
  }} />
)}
```

**Result:** Animated progress bar with step indicator and time estimates!

---

## Example 3: Dashboard - Show Token Usage

### BEFORE (Numbers):
```jsx
// Dashboard.jsx
<div className="token-stats">
  <p>Tokens Used: {tokensUsed} / {tokensAllocated}</p>
  <p>Remaining: {tokensRemaining}</p>
  <p>Days left: {daysRemaining}</p>
</div>
```

### AFTER (C1 Card):
```jsx
// Dashboard.jsx
import { C1TokenDashboard } from '@/components/C1Card';

<C1TokenDashboard tokens={{
  allocated: tokensAllocated,
  used: tokensUsed,
  usedPercent: (tokensUsed / tokensAllocated * 100),
  remaining: tokensRemaining,
  remainingPercent: (tokensRemaining / tokensAllocated * 100),
  daysRemaining: daysRemaining,
  levels: tokensByEffectivenessLevel
}} />
```

**Result:** Visual dashboard with color-coded progress bars and breakdown by effectiveness level!

---

## Example 4: Pricing Page - Show Tier Comparison

### BEFORE (HTML Table):
```jsx
// Pricing.jsx
<div className="pricing-tier">
  <h3>Pro Tier</h3>
  <p>$99/month</p>
  <ul>
    <li>10M tokens</li>
    <li>Advanced AI</li>
    <li>Priority support</li>
  </ul>
  <button>Upgrade</button>
</div>
```

### AFTER (C1 Card):
```jsx
// Pricing.jsx
import { C1PricingCard } from '@/components/C1Card';

<C1PricingCard tier={{
  tier: 'Pro',
  price: 99,
  tokens: 10000000,
  features: [
    'Advanced AI models',
    '100 builds/month',
    'Priority support',
    'Custom branding',
    'Team collaboration'
  ],
  buildFee: '$2.99',
  cashback: '30%'
}} />
```

**Result:** Beautiful pricing card with checkmarks, highlighted current tier, and upgrade button!

---

## Example 5: Build Complete - Success Alert

### BEFORE (Simple Message):
```jsx
// LiveBuildEditor.jsx
{buildComplete && (
  <div className="success">
    <p>Build complete!</p>
    <button onClick={handleDeploy}>Deploy</button>
    <button onClick={handleDownload}>Download</button>
  </div>
)}
```

### AFTER (C1 Card):
```jsx
// LiveBuildEditor.jsx
import { C1AlertCard } from '@/components/C1Card';

{buildComplete && (
  <C1AlertCard alert={{
    type: 'success',
    title: 'Build Complete!',
    message: `Your application has been built successfully in ${buildDuration}. Ready to deploy!`,
    actions: [
      { label: 'Deploy Now', action: 'deploy' },
      { label: 'Download', action: 'download' },
      { label: 'View Files', action: 'files' }
    ]
  }} />
)}
```

**Result:** Eye-catching success card with action buttons and golden yellow highlighting!

---

## Example 6: Usage Ledger - Data Table

### BEFORE (Plain Table):
```jsx
// UsageLedger.jsx
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Agent</th>
      <th>Tokens</th>
      <th>Cost</th>
    </tr>
  </thead>
  <tbody>
    {usageData.map(row => (
      <tr key={row.id}>
        <td>{row.date}</td>
        <td>{row.agent}</td>
        <td>{row.tokens}</td>
        <td>{row.cost}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### AFTER (C1 Card):
```jsx
// UsageLedger.jsx
import { C1TableCard } from '@/components/C1Card';

<C1TableCard table={{
  title: 'Usage History',
  columns: [
    { key: 'date', label: 'Date' },
    { key: 'agent', label: 'Agent' },
    { key: 'tokens', label: 'Tokens Used' },
    { key: 'cost', label: 'Cost' }
  ],
  rows: usageData,
  sortable: true,
  filterable: true,
  exportable: true
}} />
```

**Result:** Interactive table with sorting, filtering, pagination, and export options!

---

## Example 7: Analytics Chart

### BEFORE (Basic Chart):
```jsx
// DailyInsights.jsx
<div className="chart">
  <h3>Performance Trend</h3>
  <SimpleLineChart data={performanceData} />
</div>
```

### AFTER (C1 Card):
```jsx
// DailyInsights.jsx
import { C1AnalyticsCard } from '@/components/C1Card';

<C1AnalyticsCard analytics={{
  metric: 'Agent Performance',
  period: 'Last 30 days',
  current: currentPerformance,
  change: percentageChange,
  trend: trend > 0 ? 'up' : 'down',
  chartType: 'line',
  dataPoints: performanceData.map(d => ({
    date: d.date,
    value: d.performance
  }))
}} />
```

**Result:** Professional chart with trend indicators, tooltips, and time period selector!

---

## 🚀 INTEGRATION PATTERN

### Step 1: Identify UI to Replace
Look for:
- Plain text data displays
- Simple tables
- Progress indicators
- Status messages
- Metric displays
- Charts

### Step 2: Choose Card Type
- Agent info → `C1AgentCard`
- Build results → `C1BuildCard`
- Token usage → `C1TokenDashboard`
- Pricing → `C1PricingCard`
- Analytics → `C1AnalyticsCard`
- Data tables → `C1TableCard`
- Progress → `C1ProgressCard`
- Alerts → `C1AlertCard`

### Step 3: Transform Data
```javascript
// Existing data
const agent = {
  id: 1,
  name: 'Real Estate Finder',
  ...otherFields
};

// C1-ready data
const c1AgentData = {
  name: agent.name,
  status: agent.status,
  tasksCompleted: agent.metrics.tasks,
  successRate: agent.metrics.successRate,
  tokensUsed: agent.usage.tokens,
  effectivenessLevel: mapTierToLevel(agent.tier)
};
```

### Step 4: Replace Component
```jsx
// Before
<AgentInfoDisplay agent={agent} />

// After
<C1AgentCard agent={c1AgentData} />
```

---

## 💡 PRO TIPS

1. **Start with Dashboard**: Replace metrics first (highest impact)
2. **Use Grid Layout**: Show multiple cards in responsive grid
3. **Connect Real Data**: Use your existing API calls
4. **Add Loading States**: C1 components handle loading automatically
5. **Fallback UI**: Works even if C1 API is unavailable

---

## 🎯 QUICK WINS (Do These First!)

### 1. Token Dashboard (5 minutes)
```jsx
// In your main Dashboard
import { C1TokenDashboard } from '@/components/C1Card';

const tokenData = useFetchTokenUsage(); // Your existing hook

<C1TokenDashboard tokens={tokenData} />
```

### 2. Build Progress (10 minutes)
```jsx
// In Editor during build
import { C1ProgressCard } from '@/components/C1Card';

{isBuildding && (
  <C1ProgressCard progress={buildProgress} />
)}
```

### 3. Agent Cards Grid (15 minutes)
```jsx
// In AgentBuilder
import { C1AgentCard, C1CardGrid } from '@/components/C1Card';

<C1CardGrid columns={3}>
  {agents.map(agent => (
    <C1AgentCard key={agent.id} agent={agent} />
  ))}
</C1CardGrid>
```

---

**Ready to upgrade your UI!** Check `/c1-examples` to see all cards in action.
