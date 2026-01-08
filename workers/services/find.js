/**
 * FIND service (Hybrid Web + Local Knowledge)
 *
 * Web: Firecrawl Search API
 * Local: D1 FTS over grounding_documents
 */

import { errorResponse } from '../utils/responses.js';

const DEFAULT_FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev';

function clampInt(value, { min, max, fallback }) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  const integerValue = Math.floor(numberValue);
  if (integerValue < min) return min;
  if (integerValue > max) return max;
  return integerValue;
}

function normalizeSources(sources) {
  if (!sources) return ['web', 'knowledge'];
  if (Array.isArray(sources)) return sources;
  if (typeof sources === 'string') return sources.split(',').map(s => s.trim()).filter(Boolean);
  return ['web', 'knowledge'];
}

async function firecrawlSearch(env, { query, limit, scrapeOptions }) {
  const apiKey = env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY is not configured');
  }

  const baseUrl = (env.FIRECRAWL_BASE_URL || DEFAULT_FIRECRAWL_BASE_URL).replace(/\/$/, '');

  const body = {
    query,
    limit,
    sources: ['web'],
    ...(scrapeOptions ? { scrapeOptions } : {}),
  };

  const response = await fetch(`${baseUrl}/v2/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error || payload?.message || `Firecrawl request failed (${response.status})`;
    throw new Error(message);
  }

  if (!payload?.success) {
    throw new Error(payload?.error || payload?.message || 'Firecrawl request failed');
  }

  const data = payload.data;

  // Firecrawl can return either:
  // - { data: { web: [...] } } for standard search
  // - { data: [...] } when scrapeOptions returns scraped content per result
  if (Array.isArray(data)) {
    return data.map((item) => ({
      source: 'web',
      url: item.url,
      title: item.title,
      description: item.description || item.snippet,
      markdown: item.markdown,
      links: item.links,
      metadata: item.metadata,
    })).filter(r => r.url);
  }

  const web = Array.isArray(data?.web) ? data.web : [];
  return web.map((item) => ({
    source: 'web',
    url: item.url,
    title: item.title,
    description: item.description,
    position: item.position,
    category: item.category,
  })).filter(r => r.url);
}

async function searchKnowledge(env, { userId, query, limit }) {
  if (!env.DB) return [];

  // FTS5 virtual table defined in migration. If it doesn't exist yet, fail soft.
  try {
    const { results } = await env.DB.prepare(
      `SELECT
        d.id,
        d.title,
        d.source_type,
        d.source_id,
        snippet(grounding_documents_fts, 3, '<mark>', '</mark>', '…', 12) AS snippet
      FROM grounding_documents_fts
      JOIN grounding_documents d ON d.id = grounding_documents_fts.rowid
      WHERE d.user_id = ?
        AND grounding_documents_fts MATCH ?
      ORDER BY rank
      LIMIT ?`
    ).bind(userId, query, limit).all();

    return (results || []).map((row) => ({
      source: 'knowledge',
      id: row.id,
      title: row.title,
      url: row.source_id || null,
      description: row.snippet,
      source_type: row.source_type,
    }));
  } catch {
    return [];
  }
}

export async function handleFindRequest(request, env) {
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

  const query = typeof body?.query === 'string' ? body.query.trim() : '';
  if (!query) {
    return errorResponse('Query is required', 400);
  }

  const sources = normalizeSources(body?.sources);
  const limit = clampInt(body?.limit, { min: 1, max: 15, fallback: 5 });

  const scrapeOptions = body?.scrapeOptions && typeof body.scrapeOptions === 'object'
    ? body.scrapeOptions
    : {
        formats: ['markdown', 'links'],
        onlyMainContent: true,
      };

  const tasks = [];

  if (sources.includes('web')) {
    tasks.push(
      firecrawlSearch(env, { query, limit, scrapeOptions }).catch((err) => ({ __error: err }))
    );
  } else {
    tasks.push(Promise.resolve([]));
  }

  if (sources.includes('knowledge')) {
    tasks.push(
      searchKnowledge(env, { userId, query, limit: Math.min(limit, 10) }).catch(() => [])
    );
  } else {
    tasks.push(Promise.resolve([]));
  }

  const [webResultsRaw, knowledgeResultsRaw] = await Promise.all(tasks);

  const webResults = Array.isArray(webResultsRaw)
    ? webResultsRaw
    : (webResultsRaw?.__error ? [] : []);

  const knowledgeResults = Array.isArray(knowledgeResultsRaw) ? knowledgeResultsRaw : [];

  const warnings = [];
  if (webResultsRaw?.__error) {
    warnings.push({ source: 'web', message: webResultsRaw.__error?.message || 'Web search failed' });
  }

  return {
    query,
    sources,
    results: [...webResults, ...knowledgeResults].slice(0, 30),
    warnings,
  };
}
