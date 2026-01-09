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
import { useNavigate } from 'react-router-dom';
import { useChronicleEvents } from '../../hooks/useChronicleEvents.js';

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

function buildScoutBriefing(results) {
  if (!Array.isArray(results) || results.length === 0) return '';

  const perSourceMaxChars = 1800;

  return results
    .map((item, index) => {
      const title = (item?.title || item?.url || `Source ${index + 1}`).toString();
      const url = (item?.url || '').toString();
      const description = (item?.description || '').toString().trim();
      const markdown = (item?.markdown || '').toString().trim();

      const trimmedMarkdown = markdown.length > perSourceMaxChars
        ? `${markdown.slice(0, perSourceMaxChars)}\n\n…(truncated)`
        : markdown;

      return [
        `### Source ${index + 1}: ${title}`,
        url ? `URL: ${url}` : '',
        description ? `Summary: ${description}` : '',
        trimmedMarkdown,
      ]
        .filter(Boolean)
        .join('\n\n');
    })
    .join('\n\n---\n\n');
}

export default function ACHEEVYDashboard() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');

  const [showBlueprint, setShowBlueprint] = useState(true);
  const [blueprintText, setBlueprintText] = useState('');
  const [blueprintError, setBlueprintError] = useState('');

  const [scoutEnabled, setScoutEnabled] = useState(false);
  const [scoutLoading, setScoutLoading] = useState(false);
  const [scoutError, setScoutError] = useState('');
  const [scoutResults, setScoutResults] = useState([]);
  const [scoutBriefing, setScoutBriefing] = useState('');

  const [auditOpen, setAuditOpen] = useState(false);
  const {
    events: chronicleEvents,
    stats: chronicleStats,
    loading: chronicleLoading,
    error: chronicleError,
    refresh: refreshChronicle,
  } = useChronicleEvents({ limit: 50, enabled: auditOpen });

  const formatChronicleTime = useCallback((value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
  }, []);

  const summarizeChronicleEvent = useCallback((event) => {
    const type = (event?.event_type || event?.eventType || '').toString();
    const metadata = event?.metadata;

    if (type === 'scout_assisted_chat') {
      const sources = metadata?.sources_count ?? metadata?.sources ?? metadata?.sourcesAnalyzed;
      const bytes = metadata?.bytes_captured ?? metadata?.bytesCaptured;
      const tokens = metadata?.estimated_tokens ?? metadata?.estimatedTokens;
      const parts = [];
      if (typeof sources === 'number') parts.push(`${sources} sources`);
      if (typeof bytes === 'number') parts.push(`${bytes} bytes`);
      if (typeof tokens === 'number') parts.push(`~${tokens} tokens`);
      return parts.length ? parts.join(' · ') : 'FIND context used to ground chat.';
    }

    if (typeof event?.summary === 'string' && event.summary.trim()) return event.summary.trim();
    return '';
  }, []);

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

  const tokenEstimate = useMemo(() => {
    return estimateTokens(prompt, 'brainstorm', 'standard');
  }, [prompt]);

  const handleProceedToExecution = useCallback(() => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    try {
      localStorage.setItem('nurdscode_intake_prompt', trimmed);
      if (scoutBriefing) {
        localStorage.setItem('nurdscode_scout_briefing', scoutBriefing);
        localStorage.setItem('nurdscode_scout_results', JSON.stringify(scoutResults || []));
      } else {
        localStorage.removeItem('nurdscode_scout_briefing');
        localStorage.removeItem('nurdscode_scout_results');
      }
    } catch {
      // best-effort
    }

    navigate('/editor', {
      state: {
        ideaPrompt: trimmed,
        scoutBriefing: scoutBriefing || '',
        scoutResults: scoutResults || [],
      },
    });
  }, [navigate, prompt, scoutBriefing, scoutResults]);

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
        body: JSON.stringify({ query: prompt.trim(), limit: 3 }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || payload?.message || 'FIND failed');
      }

      const results = Array.isArray(payload?.results) ? payload.results : [];
      setScoutResults(results);
      setScoutBriefing(buildScoutBriefing(results));
    } catch (err) {
      setScoutError(err instanceof Error ? err.message : 'FIND failed');
    } finally {
      setScoutLoading(false);
    }
  }, [prompt, scoutLoading, getToken]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              <span className="text-gray-400">C</span>hat{' '}
              <span className="text-gray-400">w</span>
              <span className="bg-linear-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                ACHEEVY
              </span>
            </h1>
            <p className="text-gray-500 mt-2">Stage 1 intake: capture goal, constraints, and optional FIND</p>
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFindScout}
                    disabled={!prompt.trim() || scoutLoading}
                    className="px-4 py-2 rounded-xl border border-gray-700/60 text-gray-200 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {scoutLoading ? 'FIND…' : 'Run FIND'}
                  </button>
                  <button
                    onClick={handleProceedToExecution}
                    disabled={!prompt.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25 disabled:shadow-none"
                  >
                    <span>Proceed to Execution</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {scoutBriefing && (
            <div className="text-xs text-green-600 -mt-2">
              🔎 FIND context attached ({scoutResults.length} sources)
            </div>
          )}

          {(scoutLoading || scoutError || scoutResults.length > 0) && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-200">FIND</div>
                {scoutLoading && <div className="text-xs text-gray-400">Finding…</div>}
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

            <div className="bg-gray-900/40 border border-gray-700/40 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/40">
                <div className="text-sm font-medium text-gray-200">Architectural Blueprint (Intelligent Internet)</div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAuditOpen((v) => !v)}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {auditOpen ? 'Hide Audit' : 'Audit Trail'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBlueprint((v) => !v)}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {showBlueprint ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {auditOpen && (
                <div className="px-4 py-4 border-b border-gray-700/40 bg-gray-950/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-200">Audit Trail</div>
                    <button
                      type="button"
                      onClick={refreshChronicle}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                      disabled={chronicleLoading}
                    >
                      {chronicleLoading ? 'Loading…' : 'Refresh'}
                    </button>
                  </div>

                  {chronicleError && <div className="mt-2 text-sm text-red-400">{chronicleError}</div>}

                  {chronicleStats && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <div className="px-2 py-1 rounded-lg bg-gray-800/60 border border-gray-700/40 text-gray-200">
                        Events: {chronicleStats.total_events ?? 0}
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-gray-800/60 border border-gray-700/40 text-gray-200">
                        FIND Chats: {chronicleStats.total_scout_assisted_chat ?? 0}
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-gray-800/60 border border-gray-700/40 text-gray-200">
                        Sources: {chronicleStats.total_sources_analyzed ?? 0}
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-gray-800/60 border border-gray-700/40 text-gray-200">
                        Bytes: {chronicleStats.total_bytes_captured ?? 0}
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-gray-800/60 border border-gray-700/40 text-gray-200">
                        Tokens Saved: {chronicleStats.estimated_tokens_saved ?? 0}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 max-h-56 overflow-auto rounded-xl border border-gray-700/40 bg-gray-900/30">
                    {chronicleLoading && chronicleEvents.length === 0 ? (
                      <div className="p-3 text-sm text-gray-400">Loading events…</div>
                    ) : chronicleEvents.length === 0 ? (
                      <div className="p-3 text-sm text-gray-400">No events yet.</div>
                    ) : (
                      <ul className="divide-y divide-gray-700/40">
                        {chronicleEvents.map((event) => {
                          const type = (event?.event_type || event?.eventType || 'event').toString();
                          const createdAt = event?.created_at || event?.createdAt;
                          const summary = summarizeChronicleEvent(event);
                          return (
                            <li key={event?.id || `${type}-${createdAt}`} className="p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm text-gray-200">{type}</div>
                                  {summary && <div className="text-xs text-gray-400 mt-1">{summary}</div>}
                                </div>
                                <div className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatChronicleTime(createdAt)}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}

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
      </div>
    </div>
  );
}
