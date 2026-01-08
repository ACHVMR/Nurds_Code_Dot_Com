export async function runFind({ apiBase, token, query, limit = 5 } = {}) {
  const trimmed = (query || '').trim();
  if (!trimmed) throw new Error('Query is required');

  const base = (apiBase || '').replace(/\/$/, '');
  const res = await fetch(`${base}/api/v1/acheevy/find`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      query: trimmed,
      limit,
      sources: ['web', 'knowledge'],
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || payload?.message || 'FIND request failed');
  }

  // Worker responses may either be {success:true,...} or {data:{...}}
  if (payload?.data) return payload.data;
  return payload;
}
