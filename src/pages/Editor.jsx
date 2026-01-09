import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import VoiceControl from '../components/VoiceControl';
import ContextTicker from '../components/ContextTicker';
import { Sparkles, Wand2, Code2, FileCode, Zap } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { ensureLucSession, transitionLucSession, extractChatMessage, getStoredLucSessionId } from '../services/luc';
import AcheevyBezel from '../components/acheevyBezel';

const INITIAL_ASSISTANT_MESSAGES = [
  {
    role: 'assistant',
    content: 'Welcome to Vibe Coding with ACHEEVY! Ask me to generate code, refactor, explain, or optimize. Powered by CloudFlare AI.',
    model: 'llama3-8b-instant',
  },
];

function EditorPage() {
  const [code, setCode] = useState(`// 🚀 Welcome to Nurds Code | w/ACHEEVY
// Your Elite AI Engine for Rapid Application Development
//
// I'm ACHEEVY - here to help you build powerful applications
// through systematic DMAIC discovery and intelligent automation.
//
// Quick Start:
// 1. Tell me what you want to build
// 2. I'll guide you through discovery
// 3. Watch as I architect and code your vision
//
// Voice Commands: Press the golden button to speak
// Type Commands: Start typing or ask me anything
//
// Let's build something extraordinary together! 💡

console.log("Welcome to Nurds Code!");`);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState(() => [...INITIAL_ASSISTANT_MESSAGES]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantPlan, setAssistantPlan] = useState('free');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState('');
  const [interactionMode, setInteractionMode] = useState('brainstorm');
  const [agentLevel, setAgentLevel] = useState('standard');
  const [lastAcheevyMeta, setLastAcheevyMeta] = useState(null);
  const [scoutBriefing, setScoutBriefing] = useState('');
  const [scoutSources, setScoutSources] = useState([]);
  const [showScoutSources, setShowScoutSources] = useState(false);
  const [userId, setUserId] = useState('');
  const [lucSessionId, setLucSessionId] = useState(() => getStoredLucSessionId());
  const [bezelMode, setBezelMode] = useState('lab');
  const [orchestratorHydrating, setOrchestratorHydrating] = useState(false);
  const editorRef = useRef(null);
  const messagesEndRef = useRef(null);
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const location = useLocation();
  const { getToken } = useAuth();

  useEffect(() => {
    try {
      const storedCode = localStorage.getItem('nurdscode_editor_code');
      const storedLanguage = localStorage.getItem('nurdscode_editor_language');
      const storedPlan = localStorage.getItem('nurdscode_assistant_plan');
      const storedMessages = localStorage.getItem('nurdscode_assistant_history');
      const storedUserId = localStorage.getItem('nurdscode_user_id');

      // Hydrate idea from ChatWidget teleport
      const ideaPrompt = location.state?.ideaPrompt || localStorage.getItem('nurd_idea_prompt');
      if (ideaPrompt) {
        setAssistantInput(ideaPrompt);
        try { localStorage.removeItem('nurd_idea_prompt'); } catch {}
      }

      const incomingBriefing = location.state?.scoutBriefing || localStorage.getItem('nurdscode_scout_briefing');
      const incomingResults = location.state?.scoutResults || (() => {
        try {
          const raw = localStorage.getItem('nurdscode_scout_results');
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      })();

      const cameFromAcheevyIntake = !!location.state?.scoutBriefing || Array.isArray(location.state?.scoutResults);

      if (typeof incomingBriefing === 'string' && incomingBriefing.trim()) {
        setScoutBriefing(incomingBriefing);
        try { localStorage.setItem('nurdscode_scout_briefing', incomingBriefing); } catch {}
      }
      if (Array.isArray(incomingResults) && incomingResults.length) {
        setScoutSources(incomingResults);
        try { localStorage.setItem('nurdscode_scout_results', JSON.stringify(incomingResults)); } catch {}

        if (cameFromAcheevyIntake) {
          setShowScoutSources(true);
        }
      }

      if (storedCode) {
        setCode(storedCode);
      }
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
      if (storedPlan) {
        setAssistantPlan(storedPlan);
      }
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        if (Array.isArray(parsed) && parsed.length) {
          setAssistantMessages(parsed);
        }
      }
      if (storedUserId) {
        setUserId(storedUserId);
      } else if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        const newId = `user-${crypto.randomUUID()}`;
        localStorage.setItem('nurdscode_user_id', newId);
        setUserId(newId);
      } else {
        const fallbackId = `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem('nurdscode_user_id', fallbackId);
        setUserId(fallbackId);
      }
    } catch (error) {
      console.warn('Unable to restore editor state:', error);
    }
  }, []);

  // Opening the editor is treated as entering iteration mode (best-effort).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken().catch(() => null);
        if (!token || cancelled) return;
        const lucSessionId = await ensureLucSession({ apiBase, token });
        if (cancelled) return;
        setLucSessionId(lucSessionId);
        await transitionLucSession({ apiBase, token, sessionId: lucSessionId, toPhase: 'iteration' });
      } catch {
        // best-effort
      }
    })();
    return () => { cancelled = true; };
  }, [apiBase, getToken]);

  // Hydrate bezel mode from orchestrator session (D1 source of truth).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!lucSessionId) return;
      setOrchestratorHydrating(true);
      try {
        const token = await getToken().catch(() => null);
        const res = await fetch(`/api/v1/orchestrator/session/${lucSessionId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) return; // session may not exist yet (lazy-create on first switch)

        const payload = await res.json().catch(() => ({}));
        const persisted = payload?.session?.mode;
        const nextBezel =
          persisted === 'BRAINSTORMING'
            ? 'lab'
            : persisted === 'NURD_OUT'
              ? 'nerdout'
              : persisted === 'AGENT_MODE'
                ? 'forge'
                : persisted === 'EDIT_MODE'
                  ? 'polish'
                  : null;

        if (nextBezel && !cancelled) {
          setBezelMode(nextBezel);
          // Keep the assistant UX working with existing backend contract.
          if (nextBezel === 'lab') setInteractionMode('brainstorm');
          if (nextBezel === 'nerdout') setInteractionMode('forming');
          if (nextBezel === 'forge') setInteractionMode('agent');
          if (nextBezel === 'polish') setInteractionMode('forming');
        }
      } catch {
        // best-effort
      } finally {
        if (!cancelled) setOrchestratorHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getToken, lucSessionId]);

  const handleBezelModeChange = async (nextMode) => {
    setBezelMode(nextMode);

    // Map bezel -> assistant modes (existing /acheevy/chat contract)
    if (nextMode === 'lab') setInteractionMode('brainstorm');
    if (nextMode === 'nerdout') setInteractionMode('forming');
    if (nextMode === 'forge') setInteractionMode('agent');
    if (nextMode === 'polish') setInteractionMode('forming');

    if (!lucSessionId) return;

    // Map bezel -> orchestrator aliases (stored in D1 as canonical OpenHands mode)
    const modeAlias =
      nextMode === 'lab'
        ? 'brainstorm'
        : nextMode === 'nerdout'
          ? 'nurdout'
          : nextMode === 'forge'
            ? 'agent'
            : 'edit';

    try {
      const token = await getToken().catch(() => null);
      await fetch('/api/v1/orchestrator/session/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sessionId: lucSessionId, mode: modeAlias }),
      });
    } catch {
      // best-effort
    }
  };

  const handleBezelFindScout = async () => {
    const query = window.prompt('FIND (SCOUT) query: what should ACHEEVY research?');
    if (!query || !query.trim()) return;

    try {
      const token = await getToken().catch(() => null);
      const res = await fetch('/api/v1/acheevy/scout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: query.trim(), limit: 3 }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.success === false) {
        throw new Error(payload?.error || 'FIND failed.');
      }

      const results = payload?.results || payload?.data?.results || [];
      setScoutBriefing(`FIND results for: ${query.trim()}`);
      setScoutSources(Array.isArray(results) ? results : []);
      setShowScoutSources(true);
    } catch (e) {
      setAssistantError(e instanceof Error ? e.message : 'FIND failed.');
    }
  };

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('nurdscode_editor_code', code);
    } catch (error) {
      console.warn('Unable to persist code snippet:', error);
    }
  }, [code]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('nurdscode_editor_language', language);
    } catch (error) {
      console.warn('Unable to persist language selection:', error);
    }
  }, [language]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('nurdscode_assistant_plan', assistantPlan);
    } catch (error) {
      console.warn('Unable to persist assistant plan:', error);
    }
  }, [assistantPlan]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('nurdscode_assistant_history', JSON.stringify(assistantMessages));
    } catch (error) {
      console.warn('Unable to persist assistant history:', error);
    }
  }, [assistantMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantMessages, assistantLoading]);

  function detectLanguage(sample) {
    const s = (sample || '').trim();
    if (/<!DOCTYPE html>|<html[\s>]/i.test(s) || /<\/?(div|span|script|style|head|body)\b/i.test(s)) return 'html';
    if (/^\s*\/\//.test(s) || /function\s+|=>|console\.log\(/.test(s)) return 'javascript';
    if (/^\s*#\!\/usr\/bin\/env\s+node/.test(s)) return 'javascript';
    if (/\bdef\s+\w+\(|\bprint\(|^\s*#/.test(s)) return 'python';
    if (/\binterface\s+\w+\s*\{|:\s*\w+;|<\w+>/.test(s)) return 'typescript';
    if (/\{\s*[^}]*:\s*[^;]+;\s*\}/.test(s) && !/function|class|=>/.test(s)) return 'css';
    return 'javascript';
  }

  const runCode = () => {
    try {
      // Simple JavaScript execution for demo
      const langToUse = language === 'auto' ? detectLanguage(code) : language;
      if (langToUse === 'javascript') {
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.join(' ')),
        };
        
        // Create a function with custom console
        const func = new Function('console', code);
        func(customConsole);
        
        setOutput(logs.join('\n') || 'Code executed successfully!');
      } else {
        setOutput(`Detected ${language === 'auto' ? 'language: ' + (detectLanguage(code)) : language}. Execution support coming soon.`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const sendAssistantMessage = async (event) => {
    event.preventDefault();
    const trimmed = assistantInput.trim();
    if (!trimmed || assistantLoading) {
      return;
    }

    setAssistantMessages((prev) => {
      const next = [...prev, { role: 'user', content: trimmed }];
      return next.slice(-20);
    });
    setAssistantInput('');
    setAssistantError('');
    setAssistantLoading(true);

    try {
      const token = await getToken().catch(() => null);

      let sessionId = null;
      try {
        sessionId = await ensureLucSession({ apiBase, token });
      } catch {
        sessionId = null;
      }

      const resolvedMode = ['brainstorm', 'forming', 'agent'].includes(interactionMode)
        ? interactionMode
        : 'brainstorm';
      const resolvedAgentLevel = resolvedMode === 'agent'
        ? (['standard', 'swarm', 'king'].includes(agentLevel) ? agentLevel : 'standard')
        : 'standard';

      const response = await fetch('/api/v1/acheevy/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: trimmed,
          mode: resolvedMode,
          agent_level: resolvedAgentLevel,
          session_id: sessionId || undefined,
          circuit_box: [],
          scout_briefing: scoutBriefing || undefined,
          scout_sources_count: scoutBriefing ? scoutSources.length : 0,
          scout_bytes: scoutBriefing ? scoutBriefing.length : 0,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Assistant request failed.');
      }

      const payload = await response.json().catch(() => ({}));
      const acheevyResponse = payload?.response || payload?.message;
      if (!payload?.success || !acheevyResponse) {
        throw new Error(payload?.error || 'Assistant request failed.');
      }

      setLastAcheevyMeta(payload?.metadata || null);
      setAssistantMessages((prev) => {
        const next = [
          ...prev,
          {
            role: 'assistant',
            content: acheevyResponse,
            usage: payload?.metadata,
            model: payload?.metadata?.model,
          },
        ];
        return next.slice(-20);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Assistant request failed.';
      setAssistantError(message);
      setAssistantMessages((prev) => {
        const next = [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${message}`,
            error: true,
          },
        ];
        return next.slice(-20);
      });
    } finally {
      setAssistantLoading(false);
    }
  };

  const resetAssistant = () => {
    setAssistantMessages([...INITIAL_ASSISTANT_MESSAGES]);
    setAssistantError('');
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Custom AI Code Completion
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'acheevy:generate',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '// Ask ACHEEVY AI to generate code here',
            documentation: 'CloudFlare AI Code Generation',
          },
        ];
        return { suggestions };
      },
    });
  };

  const extractFirstFencedCodeBlock = (text) => {
    if (typeof text !== 'string') return '';
    const match = text.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
    return match ? match[1].trim() : '';
  };

  const callAcheevyChat = async ({ message, forceAgent = false }) => {
    const token = await getToken().catch(() => null);

    let sessionId = null;
    try {
      sessionId = await ensureLucSession({ apiBase, token });
    } catch {
      sessionId = null;
    }

    const resolvedMode = forceAgent
      ? 'agent'
      : (['brainstorm', 'forming', 'agent'].includes(interactionMode) ? interactionMode : 'brainstorm');
    const resolvedAgentLevel = resolvedMode === 'agent'
      ? (['standard', 'swarm', 'king'].includes(agentLevel) ? agentLevel : 'standard')
      : 'standard';

    const response = await fetch('/api/v1/acheevy/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        mode: resolvedMode,
        agent_level: resolvedAgentLevel,
        session_id: sessionId || undefined,
        circuit_box: [],
        scout_briefing: scoutBriefing || undefined,
        scout_sources_count: scoutBriefing ? scoutSources.length : 0,
        scout_bytes: scoutBriefing ? scoutBriefing.length : 0,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error || 'ACHEEVY request failed.');
    }

    const payload = await response.json().catch(() => ({}));
    const acheevyResponse = payload?.response || payload?.message;
    if (!payload?.success || !acheevyResponse) {
      throw new Error(payload?.error || 'ACHEEVY request failed.');
    }

    return { text: acheevyResponse, metadata: payload?.metadata || null };
  };

  const generateCodeWithAI = async (prompt) => {
    setAiGenerating(true);
    try {
      const { text } = await callAcheevyChat({
        forceAgent: true,
        message: [
          `Generate ${language} code for the following request.`,
          `Return ONLY the code in a single fenced code block and nothing else.`,
          '',
          `REQUEST: ${prompt}`,
          '',
          `EXISTING CONTEXT (may be empty):`,
          code || '',
        ].join('\n'),
      });

      const extracted = extractFirstFencedCodeBlock(text);
      setCode(extracted || text);
      setOutput('Code generated by ACHEEVY.');
    } catch (error) {
      setOutput(`AI Error: ${error.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const explainCode = async () => {
    setAiGenerating(true);
    try {
      const { text } = await callAcheevyChat({
        forceAgent: false,
        message: [
          `Explain the following ${language} code clearly and concisely.`,
          `Use headings and bullet points where helpful.`,
          '',
          code || '',
        ].join('\n'),
      });

      setOutput(text);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const optimizeCode = async () => {
    setAiGenerating(true);
    try {
      const { text } = await callAcheevyChat({
        forceAgent: true,
        message: [
          `Optimize the following ${language} code.`,
          `Return ONLY the optimized code in a single fenced code block and nothing else.`,
          '',
          code || '',
        ].join('\n'),
      });

      const extracted = extractFirstFencedCodeBlock(text);
      setCode(extracted || text);
      setOutput('Code optimized by ACHEEVY.');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AcheevyBezel
        enabled={!assistantLoading}
        mode={bezelMode}
        onModeChange={handleBezelModeChange}
        lucQuoteText={
          lastAcheevyMeta
            ? `Tokens: ${lastAcheevyMeta.estimated_tokens ?? '—'} · Cost: ${lastAcheevyMeta.estimated_cost ?? '—'}`
            : 'Tokens: —'
        }
        onFindScout={handleBezelFindScout}
      />

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2 text-text">Editor</h1>
            <p className="tagline text-2xl">Think It. Prompt It. Build It.</p>
            {orchestratorHydrating && (
              <div className="text-xs text-mute mt-2">Syncing session mode…</div>
            )}
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel - Monaco */}
          <div className="panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text flex items-center gap-2">
                <Code2 className="w-5 h-5" style={{ color: 'var(--color-golden-yellow, #E68961)' }} />
                Nurds Code | w/ACHEEVY
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                </select>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="hc-black">High Contrast</option>
                </select>
              </div>
            </div>
            
            {/* Monaco Editor with Context Ticker */}
            <div className="relative border border-[#2a2a2a] rounded-lg overflow-hidden mb-4">
              <ContextTicker />
              <Editor
                height="400px"
                language={language}
                theme={theme}
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  quickSuggestions: true,
                }}
              />
            </div>

            {/* AI Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <button
                onClick={runCode}
                className="btn-primary text-sm py-2 flex items-center justify-center gap-2"
                disabled={aiGenerating}
              >
                <Zap className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={explainCode}
                className="btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                disabled={aiGenerating || !code.trim()}
              >
                <FileCode className="w-4 h-4" />
                Explain
              </button>
              <button
                onClick={optimizeCode}
                className="btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                disabled={aiGenerating || !code.trim()}
              >
                <Wand2 className="w-4 h-4" />
                Optimize
              </button>
              <button
                onClick={() => {
                  const prompt = window.prompt('What code should ACHEEVY generate?');
                  if (prompt) generateCodeWithAI(prompt);
                }}
                className="btn-primary text-sm py-2 flex items-center justify-center gap-2 bg-[#D946EF] hover:bg-[#C740D9]"
                disabled={aiGenerating}
              >
                <Sparkles className="w-4 h-4" />
                Generate
              </button>
            </div>

            {aiGenerating && (
              <div className="text-center text-[#E68961] text-sm mb-4">
                🤖 ACHEEVY AI is thinking...
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {/* Voice Control */}
            <VoiceControl
              onTranscript={(text) => setAssistantInput((prev) => (prev ? prev + "\n" : "") + text)}
              onError={(err) => setAssistantError(err?.message || 'Voice error')}
            />
            {/* Output Panel */}
            <div className="panel">
              <h2 className="text-xl font-semibold mb-4 text-text">Output</h2>
              <div className="bg-background text-text font-mono text-sm p-4 border border-border h-48 md:h-64 overflow-auto">
                {output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-mute">Output will appear here...</div>
                )}
              </div>
            </div>

            {/* Assistant Panel */}
            <div className="panel">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-text">ACHEEVY | Nurds Code Assistant</h2>
                  <p className="text-sm text-mute">
                    Cloudflare VibeSDK hints tailored to your plan.
                  </p>
                  {scoutBriefing && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-text">
                        🔎 FIND context attached ({scoutSources.length} sources)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowScoutSources((v) => !v)}
                        className="text-xs text-accent hover:text-neon"
                      >
                        {showScoutSources ? 'Hide sources' : 'View sources'}
                      </button>
                    </div>
                  )}
                  {lastAcheevyMeta && (
                    <div className="mt-1 text-[11px] text-mute">
                      Mode: {lastAcheevyMeta.mode} · Level: {lastAcheevyMeta.agent_level} · Tokens: {lastAcheevyMeta.estimated_tokens} · Cost: {lastAcheevyMeta.estimated_cost}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={agentLevel}
                    onChange={(event) => setAgentLevel(event.target.value)}
                    className="input-field text-sm"
                    disabled={interactionMode !== 'agent'}
                  >
                    <option value="standard">Standard</option>
                    <option value="swarm">Swarm</option>
                    <option value="king">King</option>
                  </select>
                  <select
                    value={assistantPlan}
                    onChange={(event) => setAssistantPlan(event.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="free">Free · GROQ 8B</option>
                    <option value="coffee">Buy Me a Coffee · GROQ 70B</option>
                    <option value="lite">LITE · GPT-4o mini</option>
                    <option value="medium">Medium · GPT-4 & Claude</option>
                    <option value="heavy">Heavy · Advanced models</option>
                    <option value="superior">Superior · Unlimited</option>
                  </select>
                  <button
                    type="button"
                    onClick={resetAssistant}
                    className="text-xs text-accent hover:text-neon"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="bg-background border border-border h-64 overflow-y-auto px-4 py-3">
                {showScoutSources && scoutSources.length > 0 && (
                  <div className="mb-4 rounded-lg border border-border bg-white/5 p-3">
                    <div className="text-xs uppercase tracking-wide text-mute mb-2">FIND Sources</div>
                    <ul className="space-y-2">
                      {scoutSources.slice(0, 5).map((item) => (
                        <li key={item?.url || item?.title} className="text-sm">
                          {item?.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent hover:text-neon underline"
                            >
                              {item.title || item.url}
                            </a>
                          ) : (
                            <span className="text-text">{item?.title || 'Source'}</span>
                          )}
                          {item?.description && (
                            <div className="text-xs text-mute mt-1 line-clamp-2">{item.description}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {assistantMessages.map((msg, index) => (
                  <div key={`assistant-message-${index}`} className="mb-4">
                    <div className="text-xs uppercase tracking-wide text-mute mb-1">
                      {msg.role === 'assistant' ? 'Assistant' : 'You'}
                    </div>
                    <div className={`whitespace-pre-wrap text-sm ${msg.error ? 'text-accent' : 'text-text'}`}>
                      {msg.content}
                    </div>
                    {msg.model && (
                      <div className="text-[10px] uppercase text-mute mt-1">
                        Model: {msg.model}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {assistantError && (
                <div className="text-xs text-accent mt-3">
                  {assistantError}
                </div>
              )}

              <form onSubmit={sendAssistantMessage} className="mt-4 space-y-3">
                <textarea
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  className="w-full bg-background border border-border text-sm text-text p-3 focus:outline-none focus:border-accent min-h-24 resize-none"
                  placeholder="Ask about scaffolding, SDK usage, or how to improve your prompt..."
                  disabled={assistantLoading}
                />
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="btn-primary px-6"
                    disabled={assistantLoading || !assistantInput.trim()}
                  >
                    {assistantLoading ? 'Thinking...' : 'Ask Vibe Assistant'}
                  </button>
                  <span className="text-xs text-mute">
                    {assistantLoading
                      ? 'Generating guidance via Cloudflare AI Gateway'
                      : 'Responses tuned for your selected tier'}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="panel text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Instant Execution</h3>
            <p className="text-mute text-sm">
              Run your code instantly and see results in real-time
            </p>
          </div>
          <div className="panel text-center">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Auto-Save</h3>
            <p className="text-mute text-sm">
              Your code is automatically saved as you type
            </p>
          </div>
          <div className="panel text-center">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Multi-Language</h3>
            <p className="text-mute text-sm">
              Support for JavaScript, Python, TypeScript, and more
            </p>
          </div>
        </div>

        {/* Pro Features CTA */}
        <div className="panel mt-8 border-2 border-accent">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-text">Unlock Pro Features</h3>
            <p className="text-text mb-6">
              Get access to advanced debugging, code sharing, team collaboration, and more
            </p>
            <button className="btn-primary">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default EditorPage;
