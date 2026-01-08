import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { runFind } from '../../services/find';

function ResultItem({ item }) {
  const title = item.title || item.url || 'Result';
  const description = item.description || '';

  return (
    <div className="border border-white/10 rounded-lg p-3 bg-black/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-zinc-100 font-medium truncate">{title}</div>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline break-all"
            >
              {item.url}
            </a>
          )}
        </div>
        {item.source && (
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">{item.source}</span>
        )}
      </div>
      {description && (
        <div
          className="mt-2 text-xs text-zinc-400 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}

export default function FindButton({
  apiBase,
  buttonClassName,
  label = 'FIND',
  title = 'FIND',
}) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const defaultApiBase = useMemo(() => (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''), []);
  const resolvedApiBase = (apiBase ?? defaultApiBase).replace(/\/$/, '');

  const submit = async (e) => {
    e?.preventDefault?.();
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError('');

    try {
      const token = await getToken().catch(() => null);
      const payload = await runFind({ apiBase: resolvedApiBase, token, query: trimmed, limit: 5 });
      setResults(Array.isArray(payload?.results) ? payload.results : []);

      const warnings = Array.isArray(payload?.warnings) ? payload.warnings : [];
      if (warnings.length) {
        setError(warnings.map(w => w.message).filter(Boolean).join(' · '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'FIND failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        title={title}
        onClick={() => setOpen(true)}
        className={buttonClassName || 'inline-flex items-center gap-1 text-xs px-2 py-1 border border-accent/40 text-accent rounded hover:bg-accent/10'}
      >
        <Search className="w-4 h-4" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="text-sm text-zinc-200 font-medium">FIND</div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-white/5"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={submit} className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search the web (Firecrawl) + your knowledge…"
                    className="flex-1 bg-black/40 border border-white/10 rounded-md text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-accent"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className={`h-10 px-3 rounded-md border text-sm ${loading || !query.trim()
                      ? 'border-white/10 text-zinc-500 cursor-not-allowed'
                      : 'border-accent text-accent hover:bg-accent/10'
                    }`}
                  >
                    {loading ? 'Searching…' : 'Search'}
                  </button>
                </div>
                {error && <div className="mt-2 text-xs text-accent">{error}</div>}
              </form>

              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                {!loading && results.length === 0 && (
                  <div className="text-sm text-zinc-500">No results yet.</div>
                )}
                {results.map((item, idx) => (
                  <ResultItem key={`${item.url || item.id || idx}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
