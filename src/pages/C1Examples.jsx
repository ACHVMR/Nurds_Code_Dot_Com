import { useState } from 'react';
import {
  C1AgentCard,
  C1BuildCard,
  C1TokenDashboard,
  C1PricingCard,
  C1AnalyticsCard,
  C1TableCard,
  C1ProgressCard,
  C1AlertCard,
  C1CardGrid,
} from '../components/C1Card';

/**
 * C1 Thesys Integration Examples
 * Shows how to use C1 cards throughout Nurds Code
 */
export default function C1Examples() {
  const [selectedTab, setSelectedTab] = useState('agents');

  // Example data for different card types
  const exampleAgent = {
    name: 'Real Estate Finder',
    status: 'active',
    tasksCompleted: 1247,
    successRate: 94.5,
    tokensUsed: 2750000,
    effectivenessLevel: 'Advanced',
    avatar: '🏠',
  };

  const exampleBuild = {
    status: 'success',
    duration: '2m 34s',
    filesGenerated: 47,
    bundleSize: '2.3 MB',
    warnings: 2,
    errors: 0,
    outputs: ['main.js', 'styles.css', 'index.html'],
  };

  const exampleTokens = {
    allocated: 10000000,
    used: 2750000,
    usedPercent: 27.5,
    remaining: 7250000,
    remainingPercent: 72.5,
    daysRemaining: 18,
    levels: [
      {
        emoji: '🟩',
        name: 'BASIC',
        tokens: 1500000,
        percentage: 54.5,
        examples: 'Quick responses, summaries',
      },
      {
        emoji: '🟨',
        name: 'ADVANCED',
        tokens: 1000000,
        percentage: 36.4,
        examples: 'Code generation, analysis',
      },
      {
        emoji: '🟪',
        name: 'PREMIUM',
        tokens: 250000,
        percentage: 9.1,
        examples: 'Detailed writing, reasoning',
      },
    ],
  };

  const examplePricing = {
    tier: 'Pro',
    price: 99,
    tokens: 10000000,
    features: [
      'Advanced AI models',
      '100 builds/month',
      'Priority support',
      'Custom branding',
      'Team collaboration',
    ],
    buildFee: '$2.99',
    cashback: '30%',
  };

  const exampleAnalytics = {
    metric: 'Agent Performance',
    period: 'Last 30 days',
    current: 94.5,
    change: 12.5,
    trend: 'up',
    chartType: 'line',
    dataPoints: [
      { date: '2025-10-01', value: 82 },
      { date: '2025-10-08', value: 85 },
      { date: '2025-10-15', value: 89 },
      { date: '2025-10-22', value: 91 },
      { date: '2025-10-29', value: 94.5 },
    ],
  };

  const exampleTable = {
    title: 'Recent Builds',
    columns: [
      { key: 'name', label: 'Project' },
      { key: 'status', label: 'Status' },
      { key: 'duration', label: 'Duration' },
      { key: 'size', label: 'Size' },
      { key: 'date', label: 'Date' },
    ],
    rows: [
      { name: 'My App', status: 'Success', duration: '2m 34s', size: '2.3 MB', date: '2025-11-06' },
      { name: 'Dashboard', status: 'Success', duration: '1m 45s', size: '1.8 MB', date: '2025-11-05' },
      { name: 'API Service', status: 'Failed', duration: '3m 12s', size: '-', date: '2025-11-05' },
    ],
    sortable: true,
    filterable: true,
  };

  const exampleProgress = {
    task: 'Building Application',
    status: 'In Progress',
    percent: 67,
    elapsed: '1m 45s',
    remaining: '58s',
    currentStep: 4,
    totalSteps: 6,
    operation: 'Optimizing bundle...',
  };

  const exampleAlert = {
    type: 'success',
    title: 'Build Complete!',
    message: 'Your application has been built successfully and is ready to deploy.',
    actions: [
      { label: 'Deploy Now', action: 'deploy' },
      { label: 'Download', action: 'download' },
    ],
  };

  const tabs = [
    { id: 'agents', label: 'Agents', icon: '🤖' },
    { id: 'builds', label: 'Builds', icon: '🔧' },
    { id: 'tokens', label: 'Tokens', icon: '🪙' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'tables', label: 'Tables', icon: '📋' },
    { id: 'progress', label: 'Progress', icon: '⏳' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-[#E68961] to-[#D4A05F] text-transparent bg-clip-text">
            C1 Thesys Integration
          </h1>
          <p className="text-gray-400">
            Beautiful card-based UI for displaying data, analytics, and results
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3 rounded-lg transition-all ${
                selectedTab === tab.id
                  ? 'bg-[#E68961] text-black font-bold'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card Examples */}
        <div className="space-y-8">
          {selectedTab === 'agents' && (
            <div>
              <h2 className="text-2xl font-bold text-[#E68961] mb-4">Agent Performance Cards</h2>
              <p className="text-gray-400 mb-6">Display agent metrics, status, and performance</p>
              <C1AgentCard agent={exampleAgent} />
            </div>
          )}

          {selectedTab === 'builds' && (
            <div>
              <h2 className="text-2xl font-bold text-[#E68961] mb-4">Build Output Cards</h2>
              <p className="text-gray-400 mb-6">Show build results, files, and deployment options</p>
              <C1BuildCard build={exampleBuild} />
            </div>
          )}

          {selectedTab === 'tokens' && (
            <div>
              <h2 className="text-2xl font-bold text-[#E68961] mb-4">Token Usage Dashboard</h2>
              <p className="text-gray-400 mb-6">Visualize token allocation and consumption</p>
              <C1TokenDashboard tokens={exampleTokens} />
            </div>
          )}

          {selectedTab === 'pricing' && (
            <div>
              <h2 className="text-2xl font-bold text-[#E68961] mb-4">Pricing Tier Cards</h2>
              <p className="text-gray-400 mb-6">Display subscription tiers and features</p>
              <C1PricingCard tier={examplePricing} />
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-[#E68961] mb-4">Analytics Charts</h2>
              <p className="text-gray-400 mb-6">Interactive charts and data visualization</p>
              <C1AnalyticsCard analytics={exampleAnalytics} />
            </div>
          )}

          {selectedTab === 'tables' && (
            <div>
              <h2 className="text-2xl font-bold text-[#E68961] mb-4">Data Tables</h2>
              <p className="text-gray-400 mb-6">Sortable, filterable data grids</p>
              <C1TableCard table={exampleTable} />
            </div>
          )}

          {selectedTab === 'progress' && (
            <div>
              <h2 className="text-2xl font-bold text-[#E68961] mb-4">Progress Cards</h2>
              <p className="text-gray-400 mb-6">Real-time progress tracking</p>
              <C1ProgressCard progress={exampleProgress} />
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div>
              <h2 className="text-2xl font-bold text-[#E68961] mb-4">Alert Cards</h2>
              <p className="text-gray-400 mb-6">Notifications and user messages</p>
              <div className="space-y-4">
                <C1AlertCard alert={exampleAlert} />
                <C1AlertCard alert={{ ...exampleAlert, type: 'warning', title: 'Warning', message: 'Token usage at 80%' }} />
                <C1AlertCard alert={{ ...exampleAlert, type: 'error', title: 'Error', message: 'Build failed' }} />
                <C1AlertCard alert={{ ...exampleAlert, type: 'info', title: 'Info', message: 'New features available' }} />
              </div>
            </div>
          )}
        </div>

        {/* Usage Example Code */}
        <div className="mt-12 bg-[#1a1a1a] rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-[#E68961] mb-4">Usage Example</h3>
          <pre className="bg-[#0F0F0F] p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-gray-300">{`import { C1AgentCard, C1BuildCard, C1TokenDashboard } from '@/components/C1Card';

// Display agent performance
<C1AgentCard agent={{
  name: 'Real Estate Finder',
  status: 'active',
  tasksCompleted: 1247,
  successRate: 94.5,
  tokensUsed: 2750000,
  effectivenessLevel: 'Advanced'
}} />

// Display build results
<C1BuildCard build={{
  status: 'success',
  duration: '2m 34s',
  filesGenerated: 47,
  bundleSize: '2.3 MB'
}} />

// Display token usage
<C1TokenDashboard tokens={{
  allocated: 10000000,
  used: 2750000,
  remaining: 7250000
}} />`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
