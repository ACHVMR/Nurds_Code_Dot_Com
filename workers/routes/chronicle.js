/**
 * Common_Chronicle routes
 *
 * POST /api/v1/chronicle/log
 */

import { Router } from 'itty-router';
import { jsonResponse, errorResponse } from '../utils/responses.js';
import { logChronicleEvent } from '../services/chronicle.js';

export const chronicleRouter = Router({ base: '/api/v1/chronicle' });

function clampInt(value, { min, max, fallback }) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  const integerValue = Math.floor(numberValue);
  if (integerValue < min) return min;
  if (integerValue > max) return max;
  return integerValue;
}

chronicleRouter.get('/events', async (request, env) => {
  try {
    const userId = request.userId;
    if (!userId || userId === 'anonymous') {
      return errorResponse('Authentication required', 401);
    }

    const url = new URL(request.url);
    const limit = clampInt(url.searchParams.get('limit'), { min: 1, max: 500, fallback: 50 });
    const eventType = (url.searchParams.get('event_type') || '').trim();
    const since = (url.searchParams.get('since') || '').trim();

    let query = `
      SELECT
        id,
        user_id,
        event_type,
        goal,
        scout_sources_count,
        scout_bytes,
        chat_messages_count,
        stage,
        model_used,
        tokens_saved,
        metadata,
        created_at
      FROM chronicle_events
      WHERE user_id = ?
    `;

    const params = [userId];

    if (eventType) {
      query += ` AND event_type = ?`;
      params.push(eventType);
    }

    if (since) {
      query += ` AND created_at >= ?`;
      params.push(since);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const rows = await env.DB.prepare(query).bind(...params).all();

    const events = (rows?.results || []).map((row) => {
      let parsedMetadata = null;
      if (typeof row?.metadata === 'string' && row.metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(row.metadata);
        } catch {
          parsedMetadata = null;
        }
      }

      return {
        ...row,
        metadata: parsedMetadata,
      };
    });

    const stats = {
      total_events: events.length,
      total_scout_assisted_chat: events.filter((e) => e.event_type === 'scout_assisted_chat').length,
      total_sources_analyzed: events.reduce((sum, e) => sum + (Number(e.scout_sources_count) || 0), 0),
      total_bytes_captured: events.reduce((sum, e) => sum + (Number(e.scout_bytes) || 0), 0),
      estimated_tokens_saved: events.reduce((sum, e) => sum + (Number(e?.metadata?.estimated_tokens) || 0), 0),
    };

    return jsonResponse({ success: true, events, stats, limit });
  } catch (error) {
    console.error('Chronicle list error:', error);
    return errorResponse('Chronicle list failed: ' + (error?.message || 'unknown error'), 500);
  }
});

chronicleRouter.post('/log', async (request, env) => {
  try {
    const userId = request.userId;
    if (!userId || userId === 'anonymous') {
      return errorResponse('Authentication required', 401);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const eventType = typeof body?.event_type === 'string' ? body.event_type.trim() : '';
    if (!eventType) {
      return errorResponse('event_type is required', 400);
    }

    const result = await logChronicleEvent(env, {
      userId,
      eventType,
      goal: typeof body?.goal === 'string' ? body.goal : null,
      scoutSourcesCount: body?.scout_sources_count,
      scoutBytes: body?.scout_bytes,
      chatMessagesCount: body?.chat_messages_count,
      stage: typeof body?.metadata?.stage === 'string' ? body.metadata.stage : (typeof body?.stage === 'string' ? body.stage : null),
      modelUsed: typeof body?.metadata?.model_used === 'string' ? body.metadata.model_used : (typeof body?.model_used === 'string' ? body.model_used : null),
      tokensSaved: body?.metadata?.tokens_saved ?? body?.tokens_saved,
      metadata: typeof body?.metadata === 'object' && body.metadata ? body.metadata : null,
      timestamp: typeof body?.timestamp === 'string' ? body.timestamp : null,
    });

    return jsonResponse({ success: true, ...result });
  } catch (error) {
    console.error('Chronicle log error:', error);
    return errorResponse('Chronicle log failed: ' + (error?.message || 'unknown error'), 500);
  }
});
