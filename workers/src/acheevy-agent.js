/**
 * ACHEEVY CLOUDFLARE WORKER — FIND/SCOUT CAPABILITY
 *
 * POST /api/v1/acheevy/scout
 * Body: { url: string, scoutEnabled: boolean }
 */

const DEFAULT_FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev';

export async function handleScout(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = typeof body?.url === 'string' ? body.url.trim() : '';
  const scoutEnabled = !!body?.scoutEnabled;

  if (!scoutEnabled) {
    return new Response(JSON.stringify({ error: 'FIND/SCOUT not enabled' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!url) {
    return new Response(JSON.stringify({ error: 'url is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'FIRECRAWL_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const baseUrl = (env.FIRECRAWL_BASE_URL || DEFAULT_FIRECRAWL_BASE_URL).replace(/\/$/, '');

  const firecrawlResponse = await fetch(`${baseUrl}/v2/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
    }),
  });

  const data = await firecrawlResponse.json().catch(() => null);

  if (!firecrawlResponse.ok || !data?.success) {
    const message = data?.error || data?.message || `Firecrawl scrape failed (${firecrawlResponse.status})`;
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, url, data: data.data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
