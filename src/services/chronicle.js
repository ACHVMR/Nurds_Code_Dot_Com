/**
 * Chronicle API client
 * Stable response contract:
 *  - events: ChronicleEvent[] (newest-first)
 *  - stats: { total_events, total_scout_assisted_chat, total_sources_analyzed, total_bytes_captured, estimated_tokens_saved }
 */

import { fetchAuthed } from '../utils/fetchAuthed.js';

function buildQueryString({ limit, eventType, since } = {}) {
  const params = new URLSearchParams();

  if (typeof limit === 'number') params.set('limit', String(limit));
  if (eventType) params.set('event_type', String(eventType));
  if (since) params.set('since', String(since));

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function getChronicleEvents({ limit = 50, eventType, since } = {}) {
  const url = `/api/v1/chronicle/events${buildQueryString({ limit, eventType, since })}`;

  const response = await fetchAuthed(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const message = payload?.error || payload?.message || 'Unable to load Chronicle events.';
    throw new Error(message);
  }

  return {
    events: Array.isArray(payload?.events) ? payload.events : [],
    stats: payload?.stats || null,
    limit: payload?.limit,
  };
}
