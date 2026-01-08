const LUC_STORAGE_KEY = 'nurdscode_luc_session_id_v1';

export function getStoredLucSessionId() {
  try {
    return localStorage.getItem(LUC_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function storeLucSessionId(sessionId) {
  if (!sessionId) return;
  try {
    localStorage.setItem(LUC_STORAGE_KEY, sessionId);
  } catch {
    // ignore
  }
}

function cleanBase(apiBase) {
  return (apiBase || '').replace(/\/$/, '');
}

export async function initLucSession({ apiBase, token }) {
  const base = cleanBase(apiBase);
  const res = await fetch(`${base}/api/v1/luc/session/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to init LUC session');
  }

  const sessionId = data?.sessionId || '';
  if (sessionId) storeLucSessionId(sessionId);
  return sessionId;
}

export async function ensureLucSession({ apiBase, token }) {
  const existing = getStoredLucSessionId();
  if (existing) return existing;
  return initLucSession({ apiBase, token });
}

export async function transitionLucSession({ apiBase, token, sessionId, toPhase = 'iteration' }) {
  if (!sessionId) throw new Error('Missing LUC sessionId');
  const base = cleanBase(apiBase);
  const res = await fetch(`${base}/api/v1/luc/session/${sessionId}/transition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ toPhase }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to transition LUC session');
  }

  return data;
}

export function extractChatMessage(payload) {
  // Worker successResponse shape: { success, message, data: { message, usage } }
  if (!payload) return { message: '', usage: null };

  if (payload?.success === false) {
    const err = payload?.error || 'Assistant request failed';
    throw new Error(err);
  }

  const data = payload?.data || payload;
  return {
    message: data?.message || '',
    usage: data?.usage || null,
  };
}
