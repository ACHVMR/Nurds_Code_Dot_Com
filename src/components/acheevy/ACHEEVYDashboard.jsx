/**
 * ============================================
 * Chat w/ACHEEVY - II-Agent Interface
 * ============================================
 *
 * Two-stage vessel pattern:
 * Stage 1: Chat w/ACHEEVY intake (clean chat, no bezel)
 * Stage 2: Vibe Coding execution (single unified bezel)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronRight, Coins, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AcheevyBezel from '../acheevyBezel';

function estimateTokens(prompt, mode, agentLevel) {
  const baseTokens = Math.max(50, (prompt || '').length * 0.75);
  const normalizedMode = mode === 'polish' ? 'forming' : mode;
  const modeMultiplier = normalizedMode === 'brainstorm' ? 1.2 : normalizedMode === 'forming' ? 2.5 : 3.5;
  const agentMultiplier = agentLevel === 'standard' ? 1 : agentLevel === 'swarm' ? 2.5 : 5;
  const estimated = Math.round(baseTokens * modeMultiplier * agentMultiplier);
  const variance = Math.round(estimated * 0.15);
  return {
    low: Math.max(100, estimated - variance),
    high: estimated + variance,
    display: estimated < 1000 ? `~${estimated}` : `~${(estimated / 1000).toFixed(1)}k`,
  };
}

function autoSuggestAgentLevel(prompt) {
  const wordCount = (prompt || '').split(/\s+/).filter(Boolean).length;
  const hasComplexKeywords = /\b(build|create|implement|full|complete|entire|system|platform|application)\b/i.test(prompt || '');
  const hasMultipleFeatures = ((prompt || '').match(/\b(and|also|plus|with|including)\b/gi) || []).length >= 2;

  if (wordCount > 50 || (hasComplexKeywords && hasMultipleFeatures)) return 'king';
  if (wordCount > 20 || hasComplexKeywords || hasMultipleFeatures) return 'swarm';
  return 'standard';
}

function mapBezelToMode(bezelMode) {
  switch (bezelMode) {
    case 'lab':
      return 'brainstorm';
    case 'nerdout':
      return 'forming';
    case 'forge':
      return 'agent';
    case 'polish':
      return 'polish';
    default:
      return 'brainstorm';
  }
}

function mapCircuitBoxToIds(circuitBox) {
  const enabled = [];
  if (circuitBox.labs11) enabled.push('elevenlabs');
  if (circuitBox.labs12) enabled.push('twelvelabs');
  if (circuitBox.sam) enabled.push('sam');
  if (circuitBox.higgsfield) enabled.push('higgsfield');
  return enabled;
}

export default function ACHEEVYDashboard() {
  const { getToken } = useAuth();

  const [stage, setStage] = useState(1);
  const [prompt, setPrompt] = useState('');

  const [showBlueprint, setShowBlueprint] = useState(true);
  const [blueprintText, setBlueprintText] = useState('');
  const [blueprintError, setBlueprintError] = useState('');

  const [bezelMode, setBezelMode] = useState('lab');
  const [circuitBox, setCircuitBox] = useState({
    labs11: false,
    labs12: false,
    sam: false,
    higgsfield: false,
  });

  const [scoutEnabled, setScoutEnabled] = useState(false);
  const [scoutLoading, setScoutLoading] = useState(false);
  const [scoutError, setScoutError] = useState('');
  const [scoutResults, setScoutResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState(null);

  useEffect(() => {
    if (!showBlueprint) return;
    if (blueprintText || blueprintError) return;

    let cancelled = false;

    fetch('/blueprints/intelligent-internet-ecosystem.md')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load blueprint');
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        setBlueprintText(text);
      })
      .catch((err) => {
        if (cancelled) return;
        setBlueprintError(err?.message || 'Unable to load blueprint');
      });

    return () => {
      cancelled = true;
    };
  }, [showBlueprint, blueprintText, blueprintError]);

  const selectedMode = useMemo(() => mapBezelToMode(bezelMode), [bezelMode]);
  const suggestedAgentLevel = useMemo(() => autoSuggestAgentLevel(prompt), [prompt]);

  const tokenEstimate = useMemo(() => {
    const agentLevelForEstimate = selectedMode === 'agent' ? suggestedAgentLevel : 'standard';
    return estimateTokens(prompt, selectedMode, agentLevelForEstimate);
  }, [prompt, selectedMode, suggestedAgentLevel]);

  const bezelEnabled = stage === 2 && !isSubmitting;

  const handlePromptSubmit = useCallback(() => {
    if (!prompt.trim()) return;
    setStage(2);
  }, [prompt]);

  const handleFindScout = useCallback(async () => {
    if (!prompt.trim() || scoutLoading) return;

    setScoutEnabled(true);
    setScoutLoading(true);
    setScoutError('');
    setScoutResults([]);

    try {
      const token = await getToken().catch(() => null);
      const response = await fetch('/api/v1/acheevy/scout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: prompt, limit: 3 }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || payload?.message || 'SCOUT failed');
      }

      setScoutResults(Array.isArray(payload?.results) ? payload.results : []);
    } catch (err) {
      setScoutError(err instanceof Error ? err.message : 'SCOUT failed');
    } finally {
      setScoutLoading(false);
    }
  }, [prompt, scoutLoading, getToken]);

  const handleBack = useCallback(() => {
    setStage(1);
    setExecutionStatus(null);
    setScoutEnabled(false);
  }, []);

  const handleExecute = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    setExecutionStatus('processing');

    try {
      const agentLevel = selectedMode === 'agent' ? suggestedAgentLevel : 'standard';
      const circuit_box = mapCircuitBoxToIds(circuitBox);
      const endpoint = selectedMode === 'agent' ? '/api/v1/acheevy/execute' : '/api/v1/acheevy/chat';

      const payload = selectedMode === 'agent'
        ? {
            manifest: { task: prompt, mode: 'agent' },
            agent_level: agentLevel,
            circuit_box,
          }
        : {
            message: prompt,
            mode: selectedMode,
            agent_level: agentLevel,
            circuit_box,
            scoutEnabled,
          };

      const token = await getToken().catch(() => null);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Execution failed');
      }

      const result = await response.json().catch(() => null);
      console.log('ACHEEVY Response:', result);
      setExecutionStatus('success');
    } catch (error) {
      console.error(error);
      setExecutionStatus('error');
    } finally {
      setIsSubmitting(false);
      setScoutEnabled(false);
    }
  }, [prompt, selectedMode, suggestedAgentLevel, circuitBox, scoutEnabled, getToken]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {stage === 1 ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                <span className="text-gray-400">C</span>hat{' '}
                <span className="text-gray-400">w</span>
                <span className="bg-linear-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  ACHEEVY
                </span>
              </h1>
              <p className="text-gray-500 mt-2">Describe what you want to build or explore</p>
            </div>

            <div className="relative">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What would you like to create today?"
                  className="w-full bg-transparent text-white placeholder-gray-500 p-6 pb-16 resize-none focus:outline-none min-h-40 text-lg"
                />

                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/30 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Coins className="w-4 h-4" />
                    <span>{tokenEstimate.display} tokens</span>
                  </div>

                  <button
                    onClick={handlePromptSubmit}
                    disabled={!prompt.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25 disabled:shadow-none"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-700/40 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/40">
                <div className="text-sm font-medium text-gray-200">Architectural Blueprint (Intelligent Internet)</div>
                <button
                  type="button"
                  onClick={() => setShowBlueprint((v) => !v)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {showBlueprint ? 'Hide' : 'Show'}
                </button>
              </div>

              {showBlueprint && (
                <div className="p-4">
                  {blueprintError ? (
                    <div className="text-sm text-red-400">{blueprintError}</div>
                  ) : (
                    <div className="text-xs text-gray-300 leading-relaxed max-h-80 overflow-auto">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children, ...props }) => (
                            <h1 className="text-base font-semibold text-white mt-4 first:mt-0" {...props}>
                              {children}
                            </h1>
                          ),
                          h2: ({ children, ...props }) => (
                            <h2 className="text-sm font-semibold text-white mt-4 first:mt-0" {...props}>
                              {children}
                            </h2>
                          ),
                          h3: ({ children, ...props }) => (
                            <h3 className="text-sm font-medium text-white mt-3 first:mt-0" {...props}>
                              {children}
                            </h3>
                          ),
                          p: ({ children, ...props }) => (
                            <p className="mt-2 first:mt-0" {...props}>
                              {children}
                            </p>
                          ),
                          ul: ({ children, ...props }) => (
                            <ul className="list-disc pl-5 mt-2" {...props}>
                              {children}
                            </ul>
                          ),
                          ol: ({ children, ...props }) => (
                            <ol className="list-decimal pl-5 mt-2" {...props}>
                              {children}
                            </ol>
                          ),
                          a: ({ children, href, ...props }) => (
                            <a
                              className="text-purple-300 hover:text-purple-200 underline"
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              {...props}
                            >
                              {children}
                            </a>
                          ),
                          code: ({ children, ...props }) => (
                            <code className="text-gray-100 bg-gray-800/60 px-1 py-0.5 rounded" {...props}>
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {blueprintText || 'Loading blueprint…'}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AcheevyBezel
              enabled={bezelEnabled}
              mode={bezelMode}
              onModeChange={setBezelMode}
              lucQuoteText={`Tokens: ${tokenEstimate.low}–${tokenEstimate.high}`}
              onFindScout={handleFindScout}
              circuitBox={circuitBox}
              onCircuitBoxChange={setCircuitBox}
            />

            {(scoutLoading || scoutError || scoutResults.length > 0) && (
              <div className="bg-gray-900/40 border border-gray-700/40 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-200">SCOUT</div>
                  {scoutLoading && <div className="text-xs text-gray-400">Scouting…</div>}
                </div>

                {scoutError && <div className="mt-2 text-sm text-red-400">{scoutError}</div>}

                {scoutResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-gray-400">Captured sources: {scoutResults.length}</div>
                    <ul className="space-y-2">
                      {scoutResults.map((item) => (
                        <li key={item.url} className="text-sm">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-300 hover:text-purple-200 underline"
                          >
                            {item.title || item.url}
                          </a>
                          {item.description && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Edit prompt</span>
              </button>

              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">{tokenEstimate.display} tokens</span>
              </div>
            </div>

            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <p className="text-gray-300 whitespace-pre-wrap">{prompt}</p>
            </div>

            <button
              type="button"
              onClick={handleExecute}
              disabled={isSubmitting}
              className={
                `w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all ` +
                (isSubmitting
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : executionStatus === 'success'
                    ? 'bg-green-500 text-white'
                    : executionStatus === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-linear-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white shadow-xl shadow-purple-500/25')
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Execute</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
