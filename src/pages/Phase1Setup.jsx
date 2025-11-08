import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

/**
 * Phase 1 Setup Guide
 * Interactive checklist for Algorand blockchain integration setup
 */
export default function Phase1Setup() {
  const { isSignedIn } = useAuth();
  const [setupSteps, setSetupSteps] = useState({
    purestake: false,
    algorandAccount: false,
    envConfig: false,
    wranglerSecrets: false,
    dbMigration: false,
    connectionTest: false,
    fullTest: false,
  });

  const [testResults, setTestResults] = useState({
    connection: null,
    phase1: null,
  });

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#E68961] mb-4">Please Sign In</h2>
          <p className="text-gray-400">You must be signed in to access Phase 1 setup.</p>
        </div>
      </div>
    );
  }

  const toggleStep = (step) => {
    setSetupSteps((prev) => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const allStepsComplete = Object.values(setupSteps).every((step) => step === true);
  const completedCount = Object.values(setupSteps).filter((step) => step === true).length;
  const totalSteps = Object.keys(setupSteps).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#E68961] mb-2">
            🚀 Phase 1: Algorand Blockchain Setup
          </h1>
          <p className="text-gray-400">
            Complete these steps to enable Creator Economy Plug Store NFT minting
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-[#1a1a1a] rounded-lg p-6 border-2 border-[#E68961]/30">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-[#E68961]">Setup Progress</span>
            <span className="text-2xl font-bold text-[#E68961]">
              {completedCount} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4">
            <div
              className="bg-[#E68961] h-4 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalSteps) * 100}%` }}
            />
          </div>
          {allStepsComplete && (
            <div className="mt-4 text-center text-[#E68961] font-bold text-xl">
              🎉 All steps complete! Ready to test.
            </div>
          )}
        </div>

        {/* Setup Steps */}
        <div className="space-y-4">
          {/* Step 1: PureStake API */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border-2 border-gray-700">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={setupSteps.purestake}
                onChange={() => toggleStep('purestake')}
                className="mt-1 w-6 h-6 accent-[#E68961] cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#E68961] mb-2">
                  1. Get PureStake API Key
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4">
                  <li>
                    Visit{' '}
                    <a
                      href="https://developer.purestake.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E68961] hover:underline"
                    >
                      https://developer.purestake.io/
                    </a>
                  </li>
                  <li>Sign up for a free account</li>
                  <li>Create a new app</li>
                  <li>Copy your API key</li>
                </ol>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Expected format:</span>
                    <button
                      onClick={() =>
                        copyToClipboard('your_purestake_api_key_here')
                      }
                      className="text-xs text-[#E68961] hover:underline"
                    >
                      Copy Template
                    </button>
                  </div>
                  <code className="text-sm text-[#E68961]">
                    VITE_ALGOD_TOKEN=your_purestake_api_key_here
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Algorand Account */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border-2 border-gray-700">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={setupSteps.algorandAccount}
                onChange={() => toggleStep('algorandAccount')}
                className="mt-1 w-6 h-6 accent-[#E68961] cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#E68961] mb-2">
                  2. Create Algorand Testnet Account
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4">
                  <li>
                    Visit{' '}
                    <a
                      href="https://testnet.algoexplorer.io/dispenser"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E68961] hover:underline"
                    >
                      https://testnet.algoexplorer.io/dispenser
                    </a>
                  </li>
                  <li>Click "Generate Account"</li>
                  <li>
                    <span className="text-red-500 font-bold">CRITICAL:</span> Save your
                    25-word mnemonic in a password manager
                  </li>
                  <li>Request testnet ALGO from faucet (free)</li>
                  <li>Copy your address (starts with "ALGO...")</li>
                </ol>
                <div className="bg-red-950 border border-red-500 p-4 rounded mb-4">
                  <p className="text-red-300 font-bold">⚠️ Security Warning</p>
                  <p className="text-red-200 text-sm mt-2">
                    Never share your 25-word mnemonic phrase. This is your private key!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: .env.local Configuration */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border-2 border-gray-700">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={setupSteps.envConfig}
                onChange={() => toggleStep('envConfig')}
                className="mt-1 w-6 h-6 accent-[#E68961] cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#E68961] mb-2">
                  3. Update .env.local
                </h3>
                <p className="text-gray-300 mb-4">
                  Update the <code className="text-[#E68961]">.env.local</code> file with
                  your credentials:
                </p>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Configuration:</span>
                    <button
                      onClick={() =>
                        copyToClipboard(`VITE_ALGOD_TOKEN=your_purestake_api_key
VITE_ALGOD_SERVER=https://testnet-algorand.api.purestake.io/ps2
VITE_ALGOD_PORT=
VITE_INDEXER_SERVER=https://testnet-algorand.api.purestake.io/idx2
VITE_TREASURY_ADDRESS=your_algorand_address`)
                      }
                      className="text-xs text-[#E68961] hover:underline"
                    >
                      Copy All
                    </button>
                  </div>
                  <pre className="text-sm text-[#E68961] overflow-x-auto">
                    {`VITE_ALGOD_TOKEN=your_purestake_api_key
VITE_ALGOD_SERVER=https://testnet-algorand.api.purestake.io/ps2
VITE_ALGOD_PORT=
VITE_INDEXER_SERVER=https://testnet-algorand.api.purestake.io/idx2
VITE_TREASURY_ADDRESS=your_algorand_address`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Wrangler Secrets */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border-2 border-gray-700">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={setupSteps.wranglerSecrets}
                onChange={() => toggleStep('wranglerSecrets')}
                className="mt-1 w-6 h-6 accent-[#E68961] cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#E68961] mb-2">
                  4. Configure Wrangler Secrets
                </h3>
                <p className="text-gray-300 mb-4">Run these commands in PowerShell:</p>
                <div className="space-y-3">
                  <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Set API Token:</span>
                      <button
                        onClick={() => copyToClipboard('wrangler secret put ALGOD_TOKEN')}
                        className="text-xs text-[#E68961] hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <code className="text-sm text-[#E68961]">
                      wrangler secret put ALGOD_TOKEN
                    </code>
                    <p className="text-xs text-gray-500 mt-2">
                      Then paste your PureStake API key when prompted
                    </p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Set Mnemonic:</span>
                      <button
                        onClick={() =>
                          copyToClipboard('wrangler secret put TREASURY_MNEMONIC')
                        }
                        className="text-xs text-[#E68961] hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <code className="text-sm text-[#E68961]">
                      wrangler secret put TREASURY_MNEMONIC
                    </code>
                    <p className="text-xs text-gray-500 mt-2">
                      Then paste your 25-word mnemonic phrase when prompted
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Database Migration */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border-2 border-gray-700">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={setupSteps.dbMigration}
                onChange={() => toggleStep('dbMigration')}
                className="mt-1 w-6 h-6 accent-[#E68961] cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#E68961] mb-2">
                  5. Apply Database Migration
                </h3>
                <p className="text-gray-300 mb-4">Choose one method:</p>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-[#E68961] mb-2">Option A: Supabase Dashboard</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                      <li>
                        Open{' '}
                        <a
                          href="https://app.supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E68961] hover:underline"
                        >
                          https://app.supabase.com
                        </a>
                      </li>
                      <li>Go to SQL Editor</li>
                      <li>
                        Copy content from{' '}
                        <code className="text-[#E68961]">
                          supabase/migrations/0007_plug_store.sql
                        </code>
                      </li>
                      <li>Execute the SQL</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold text-[#E68961] mb-2">Option B: Supabase CLI</p>
                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                      <button
                        onClick={() => copyToClipboard('supabase db push')}
                        className="text-xs text-[#E68961] hover:underline float-right"
                      >
                        Copy
                      </button>
                      <code className="text-sm text-[#E68961]">supabase db push</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6: Connection Test */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border-2 border-gray-700">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={setupSteps.connectionTest}
                onChange={() => toggleStep('connectionTest')}
                className="mt-1 w-6 h-6 accent-[#E68961] cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#E68961] mb-2">
                  6. Test Algorand Connection
                </h3>
                <p className="text-gray-300 mb-4">Verify your PureStake API connection:</p>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Command:</span>
                    <button
                      onClick={() => copyToClipboard('npm run test:algorand')}
                      className="text-xs text-[#E68961] hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="text-sm text-[#E68961]">npm run test:algorand</code>
                </div>
                <div className="mt-4 bg-green-950 border border-green-500 p-3 rounded">
                  <p className="text-green-300 text-sm font-semibold">Expected Output:</p>
                  <pre className="text-xs text-green-200 mt-2">
                    ✅ Connected to Algorand testnet{'\n'}
                    Last Round: 12345678{'\n'}
                    Genesis ID: testnet-v1.0
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Step 7: Full Test */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border-2 border-gray-700">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={setupSteps.fullTest}
                onChange={() => toggleStep('fullTest')}
                className="mt-1 w-6 h-6 accent-[#E68961] cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#E68961] mb-2">
                  7. Run Full Phase 1 Test Suite
                </h3>
                <p className="text-gray-300 mb-4">
                  Comprehensive test of all Phase 1 components:
                </p>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Command:</span>
                    <button
                      onClick={() => copyToClipboard('npm run test:phase1')}
                      className="text-xs text-[#E68961] hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="text-sm text-[#E68961]">npm run test:phase1</code>
                </div>
                <div className="mt-4 bg-green-950 border border-green-500 p-3 rounded">
                  <p className="text-green-300 text-sm font-semibold">Expected Output:</p>
                  <pre className="text-xs text-green-200 mt-2">
                    ✅ Algorand Connection: PASS{'\n'}
                    ✅ Pera Wallet Service: PASS{'\n'}
                    ✅ Database Access: PASS{'\n'}
                    🎉 All tests passed! Phase 1 is ready.
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-8 bg-[#1a1a1a] rounded-lg p-6 border-2 border-[#E68961]/30">
          <h2 className="text-2xl font-bold text-[#E68961] mb-4">📚 Documentation</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-900 p-4 rounded">
              <h3 className="font-bold text-[#E68961] mb-2">Quick Start</h3>
              <p className="text-sm text-gray-400">
                <code>PHASE-1-QUICKSTART.md</code>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Day-by-day implementation guide
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded">
              <h3 className="font-bold text-[#E68961] mb-2">Summary</h3>
              <p className="text-sm text-gray-400">
                <code>PHASE-1-SUMMARY.md</code>
              </p>
              <p className="text-xs text-gray-500 mt-2">Architecture & achievements</p>
            </div>
            <div className="bg-gray-900 p-4 rounded">
              <h3 className="font-bold text-[#E68961] mb-2">Next Steps</h3>
              <p className="text-sm text-gray-400">
                <code>PHASE-1-NEXT-STEPS.md</code>
              </p>
              <p className="text-xs text-gray-500 mt-2">Action items guide</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {allStepsComplete && (
          <div className="mt-8 bg-gradient-to-r from-green-900 to-[#E68961]/20 rounded-lg p-8 border-2 border-[#E68961] text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-[#E68961] mb-4">
              Phase 1 Setup Complete!
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              You're ready to start minting Plugs as NFTs on Algorand blockchain
            </p>
            <div className="space-y-2 text-left max-w-2xl mx-auto">
              <p className="text-gray-300">✅ Algorand SDK configured</p>
              <p className="text-gray-300">✅ Pera Wallet integrated</p>
              <p className="text-gray-300">✅ Database schema deployed</p>
              <p className="text-gray-300">✅ Test scripts verified</p>
            </div>
            <div className="mt-6">
              <a
                href="/"
                className="inline-block bg-[#E68961] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#D4A05F] transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
