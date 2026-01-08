/**
 * SCOUT service (Web crawl/scrape via Firecrawl)
 *
 * Stage-2 bezel triggers SCOUT behavior. This endpoint performs a web search
 * and returns scraped main-content (markdown) for top results.
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

async function firecrawlScout(env, { query, limit }) {
  const apiKey = env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY is not configured');
  }

  const baseUrl = (env.FIRECRAWL_BASE_URL || DEFAULT_FIRECRAWL_BASE_URL).replace(/\/$/, '');

  const body = {
    query,
    limit,
    sources: ['web'],
    scrapeOptions: {
      formats: ['markdown', 'links'],
      onlyMainContent: true,
    },
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

  // When scrapeOptions is used, Firecrawl may return an array of results.
  const results = Array.isArray(data)
    ? data
    : Array.isArray(data?.web)
      ? data.web
      : [];

  return results
    .map((item) => ({
      url: item.url,
      title: item.title,
      description: item.description || item.snippet,
      markdown: item.markdown,
      links: item.links,
      metadata: item.metadata,
    }))
    .filter((r) => r.url);
}

export async function handleScoutRequest(request, env) {
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

  const limit = clampInt(body?.limit, { min: 1, max: 8, fallback: 3 });

  const results = await firecrawlScout(env, { query, limit });

  return {
    query,
    limit,
    results,
  };
}
