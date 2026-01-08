import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, X, Send, CornerUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ensureLucSession, transitionLucSession, extractChatMessage } from '../services/luc';

const STORAGE_KEY = 'acheevy_chat_history_v1';
const STORAGE_DRAFT_KEY = 'acheevy_chat_draft_v1';

function useLocalChat() {
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [
        { role: 'assistant', content: 'Hi, I\'m ACHEEVY. Think it. Prompt it. Build it. Pitch me your idea and I\'ll help turn it into running code.' }
      ];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
      return [
        { role: 'assistant', content: 'Hi, I\'m ACHEEVY. Think it. Prompt it. Build it. Pitch me your idea and I\'ll help turn it into running code.' }
      ];
    } catch {
      return [
        { role: 'assistant', content: 'Hi, I\'m ACHEEVY. Think it. Prompt it. Build it. Pitch me your idea and I\'ll help turn it into running code.' }
      ];
    }
  });

  const [draft, setDraft] = useState(() => localStorage.getItem(STORAGE_DRAFT_KEY) || '');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_DRAFT_KEY, draft); } catch {}
  }, [draft]);

  return { messages, setMessages, draft, setDraft };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { messages, setMessages, draft, setDraft } = useLocalChat();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  const canSend = draft.trim().length > 0 && !loading;

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages, loading]);

  const send = async (e) => {
    e?.preventDefault?.();
    const text = draft.trim();
    if (!text || loading) return;

    const newHistory = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setDraft('');
    setError('');
    setLoading(true);

    try {
      const token = await getToken().catch(() => null);

      const lucSessionId = await ensureLucSession({ apiBase, token });

      const chatMessages = newHistory
        .slice(-10)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: chatMessages,
          lucSessionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Assistant request failed');
      }

      const payload = await res.json().catch(() => ({}));
      const extracted = extractChatMessage(payload);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: extracted.message, usage: extracted.usage },
      ].slice(-30));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach assistant';
      setError(msg);
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${msg}`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const teleportWith = async (idea) => {
    const teleportIdea = idea || draft || '';
    try { localStorage.setItem('nurd_idea_prompt', teleportIdea); } catch {}

    try {
      const token = await getToken().catch(() => null);
      const lucSessionId = await ensureLucSession({ apiBase, token });
      await transitionLucSession({ apiBase, token, sessionId: lucSessionId, toPhase: 'iteration' });
    } catch {
      // best-effort: teleport should still work if LUC is unavailable
    }

    navigate('/editor', { state: { ideaPrompt: teleportIdea } });
  };

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && !messages[i].error) return messages[i].content;
    }
    return '';
  }, [messages]);

  return (
    <div className="fixed z-50 right-4 bottom-4">
      {/* Toggle button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-black/80 hover:bg-black text-white shadow-lg border border-white/10 w-14 h-14 flex items-center justify-center"
          aria-label="Open ACHEEVY chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="w-[92vw] max-w-md h-[70vh] sm:h-[60vh] bg-zinc-950/95 backdrop-blur border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex flex-col">
              <span className="text-sm text-zinc-400">ACHEEVY</span>
              <span className="text-xs text-zinc-500">Think it. Prompt it. Build it.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => teleportWith(draft || lastAssistant)}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-accent/40 text-accent rounded hover:bg-accent/10"
                title="Teleport to Editor"
              >
                <CornerUpRight className="w-4 h-4" />
                Teleport
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/5"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'assistant' ? 'text-zinc-200' : 'text-zinc-100'}>
                <div className={`inline-block max-w-[85%] whitespace-pre-wrap text-sm px-3 py-2 rounded-lg ${
                  m.role === 'assistant'
                    ? 'bg-white/5 border border-white/10'
                    : 'bg-accent/20 border border-accent/40 text-accent-foreground'
                } ${m.error ? 'border-accent text-accent' : ''}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-zinc-500">Acheevy is thinking…</div>
            )}
            {error && (
              <div className="text-xs text-accent">{error}</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <form onSubmit={send} className="p-3 border-t border-white/10">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={1}
                placeholder="Pitch your idea…"
                className="flex-1 min-h-10 max-h-28 resize-y bg-black/40 border border-white/10 rounded-md text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-accent"
                disabled={loading}
              />
              <button
                type="submit"
                className={`inline-flex items-center justify-center h-10 w-10 rounded-md border ${canSend ? 'border-accent text-accent hover:bg-accent/10' : 'border-white/10 text-zinc-500 cursor-not-allowed'}`}
                disabled={!canSend}
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => teleportWith(draft || lastAssistant)}
                className="text-xs text-accent hover:underline"
              >
                Use this in Editor →
              </button>
              <button
                type="button"
                onClick={() => setMessages([{ role: 'assistant', content: 'New thread. What\'s the next idea?' }])}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
