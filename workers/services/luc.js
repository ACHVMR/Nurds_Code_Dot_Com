/**
 * LUC - Lightweight Usage Counters (chat vs iteration)
 *
 * Design goals:
 * - Source of truth is server-captured token counts from provider responses.
 * - Phase is persisted server-side (chat -> iteration, never reverts).
 * - Metered billing reporting is best-effort (fail-open for product UX).
 */

import { jsonResponse } from '../utils/responses.js';

export const LUC_PHASES = {
  chat: 'chat',
  iteration: 'iteration',
  complete: 'complete',
};

function nowIso() {
  return new Date().toISOString();
}

function asInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export function extractTokenUsage(provider, completion) {
  if (!completion) {
    return { inputTokens: 0, outputTokens: 0, model: 'unknown' };
  }

  // OpenAI / Groq (OpenAI-compatible) responses
  if (provider === 'openai' || provider === 'groq') {
    const usage = completion.usage || {};
    const inputTokens = asInt(usage.prompt_tokens, 0);
    const outputTokens = asInt(usage.completion_tokens, 0);
    const model = completion.model || 'unknown';
    return { inputTokens, outputTokens, model };
  }

  // Claude is normalized in workers/services/ai.js to OpenAI usage shape
  if (provider === 'claude') {
    const usage = completion.usage || {};
    const inputTokens = asInt(usage.prompt_tokens, 0);
    const outputTokens = asInt(usage.completion_tokens, 0);
    const model = completion.model || 'unknown';
    return { inputTokens, outputTokens, model };
  }

  // Cloudflare Workers AI generally doesn't provide token counts in a portable way.
  // If a future response includes usage, we can pick it up here.
  const maybeUsage = completion.usage || completion.usageMetadata || completion.usage_metadata;
  if (maybeUsage) {
    const inputTokens = asInt(maybeUsage.prompt_tokens ?? maybeUsage.input_tokens ?? maybeUsage.inputTokenCount?.totalTokens, 0);
    const outputTokens = asInt(maybeUsage.completion_tokens ?? maybeUsage.output_tokens ?? maybeUsage.outputTokenCount?.totalTokens, 0);
    const model = completion.model || completion.modelId || 'unknown';
    return { inputTokens, outputTokens, model };
  }

  return { inputTokens: 0, outputTokens: 0, model: completion.model || 'unknown' };
}

export async function estimateCostCents(env, model, totalTokens) {
  // 1) Optional per-model pricing override
  try {
    const row = await env.DB.prepare(
      `SELECT input_cost_per_million_usd, output_cost_per_million_usd FROM luc_pricing WHERE model = ?`
    ).bind(model).first();

    if (row?.input_cost_per_million_usd != null || row?.output_cost_per_million_usd != null) {
      const blendedPerMillion = Number(row.input_cost_per_million_usd || 0) + Number(row.output_cost_per_million_usd || 0);
      const usd = (asInt(totalTokens, 0) / 1_000_000) * blendedPerMillion;
      return Math.round(usd * 100);
    }
  } catch {
    // ignore
  }

  // 2) Fallback to model-router heuristic pricing (already used elsewhere)
  try {
    const { ModelRouter } = await import('../sdk/model-router.js');
    const router = new ModelRouter(env);
    const usd = router.estimateCost(asInt(totalTokens, 0), model || 'unknown');
    return Math.round(usd * 100);
  } catch {
    return 0;
  }
}

async function reportToCloudflareMeter(env, meterEvent) {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const meterId = env.CLOUDFLARE_METER_ID || env.STRIPE_METER_ID;

  if (!accountId || !apiToken || !meterId) {
    return { ok: false, provider: 'cloudflare', providerEventId: null, skipped: true };
  }

  const apiBase = env.CLOUDFLARE_METER_API_BASE || 'https://api.cloudflare.com/client/v4';

  const res = await fetch(
    `${apiBase}/accounts/${accountId}/billing/meters/${meterId}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meterEvent),
    }
  );

  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  return {
    ok: res.ok,
    provider: 'cloudflare',
    providerEventId: parsed?.result?.id || parsed?.result?.event_id || null,
    raw: res.ok ? null : text,
    skipped: false,
  };
}

async function reportToStripeMeter(env, meterEvent) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_METER_ID) {
    return { ok: false, provider: 'stripe', providerEventId: null, skipped: true };
  }

  // Stripe's Billing Meter Events API uses event_name + payload
  const stripe = await import('stripe').then((m) => new m.default(env.STRIPE_SECRET_KEY));

  // We store cents in value. Keep as string to match other code patterns.
  const resp = await stripe.billing.meterEvents.create({
    event_name: meterEvent.event,
    payload: {
      ...meterEvent.dimensions,
      value: String(meterEvent.value),
      timestamp: meterEvent.timestamp,
    },
  });

  return { ok: true, provider: 'stripe', providerEventId: resp?.id || null, skipped: false };
}

export async function reportTokenUsage(env, { sessionId, userId, phase, model, costCents, refunded }) {
  const meterEvent = {
    event: 'token_usage',
    timestamp: nowIso(),
    value: asInt(costCents, 0),
    dimensions: {
      userId,
      sessionId,
      phase,
      model,
      refunded: Boolean(refunded),
    },
  };

  const providerPref = (env.LUC_METER_PROVIDER || 'cloudflare').toLowerCase();

  // Best-effort; if preferred provider fails, optionally fall back to the other.
  let result;
  try {
    result = providerPref === 'stripe'
      ? await reportToStripeMeter(env, meterEvent)
      : await reportToCloudflareMeter(env, meterEvent);
  } catch (e) {
    result = { ok: false, provider: providerPref, providerEventId: null, error: e?.message || String(e), skipped: false };
  }

  if (!result.ok && env.LUC_METER_FALLBACK === 'true') {
    try {
      result = providerPref === 'stripe'
        ? await reportToCloudflareMeter(env, meterEvent)
        : await reportToStripeMeter(env, meterEvent);
    } catch (e) {
      result = { ok: false, provider: 'fallback', providerEventId: null, error: e?.message || String(e), skipped: false };
    }
  }

  try {
    await env.DB.prepare(
      `INSERT INTO luc_meter_events (session_id, user_id, phase, model, refunded, value_cents, provider, provider_event_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      sessionId,
      userId,
      phase,
      model || 'unknown',
      refunded ? 1 : 0,
      asInt(costCents, 0),
      result.provider || providerPref,
      result.providerEventId
    ).run();
  } catch {
    // ignore logging failures
  }

  return result;
}

export async function getLucSession(env, sessionId) {
  return env.DB.prepare(
    `SELECT * FROM luc_sessions WHERE session_id = ?`
  ).bind(sessionId).first();
}

export async function assertLucSessionOwner(env, sessionId, userId) {
  const session = await getLucSession(env, sessionId);
  if (!session) {
    return { ok: false, status: 404, error: 'LUC session not found' };
  }
  if (session.user_id !== userId) {
    return { ok: false, status: 403, error: 'Forbidden' };
  }
  return { ok: true, session };
}

export async function createLucSession(env, userId) {
  const sessionId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO luc_sessions (session_id, user_id, status, current_phase, created_at, updated_at)
     VALUES (?, ?, 'active', 'chat', ?, ?)`
  ).bind(sessionId, userId, nowIso(), nowIso()).run();
  return sessionId;
}

export async function transitionLucSession(env, sessionId, userId, toPhase) {
  const check = await assertLucSessionOwner(env, sessionId, userId);
  if (!check.ok) return check;

  const session = check.session;

  if (session.status !== 'active') {
    return { ok: false, status: 400, error: 'Session is not active' };
  }

  if (toPhase !== LUC_PHASES.iteration) {
    return { ok: false, status: 400, error: 'Only transition to iteration is supported' };
  }

  if (session.current_phase === LUC_PHASES.iteration) {
    return { ok: true, session };
  }

  if (session.current_phase !== LUC_PHASES.chat) {
    return { ok: false, status: 400, error: 'Invalid current phase' };
  }

  const ts = nowIso();
  await env.DB.prepare(
    `UPDATE luc_sessions
     SET current_phase = 'iteration', phase_transition_at = ?, updated_at = ?
     WHERE session_id = ? AND user_id = ?`
  ).bind(ts, ts, sessionId, userId).run();

  const updated = await getLucSession(env, sessionId);
  return { ok: true, session: updated };
}

export async function trackLucUsage(env, {
  sessionId,
  userId,
  provider,
  model,
  inputTokens,
  outputTokens,
  phase,
}) {
  const check = await assertLucSessionOwner(env, sessionId, userId);
  if (!check.ok) return check;

  const session = check.session;
  if (session.status !== 'active') {
    return { ok: false, status: 400, error: 'Session is not active' };
  }

  const effectivePhase = phase || session.current_phase;
  if (effectivePhase !== LUC_PHASES.chat && effectivePhase !== LUC_PHASES.iteration) {
    return { ok: false, status: 400, error: 'Invalid phase' };
  }

  const totalTokens = asInt(inputTokens, 0) + asInt(outputTokens, 0);
  const costCents = await estimateCostCents(env, model, totalTokens);

  await env.DB.prepare(
    `INSERT INTO luc_usage_events
      (session_id, user_id, phase, provider, model, input_tokens, output_tokens, total_tokens, cost_cents)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    sessionId,
    userId,
    effectivePhase,
    provider || 'unknown',
    model || 'unknown',
    asInt(inputTokens, 0),
    asInt(outputTokens, 0),
    totalTokens,
    costCents
  ).run();

  const updates = {
    updated_at: nowIso(),
  };

  if (effectivePhase === LUC_PHASES.chat) {
    await env.DB.prepare(
      `UPDATE luc_sessions
       SET chat_input_tokens = chat_input_tokens + ?,
           chat_output_tokens = chat_output_tokens + ?,
           chat_cost_cents = chat_cost_cents + ?,
           updated_at = ?
       WHERE session_id = ? AND user_id = ?`
    ).bind(asInt(inputTokens, 0), asInt(outputTokens, 0), costCents, updates.updated_at, sessionId, userId).run();
  } else {
    await env.DB.prepare(
      `UPDATE luc_sessions
       SET iteration_input_tokens = iteration_input_tokens + ?,
           iteration_output_tokens = iteration_output_tokens + ?,
           iteration_cost_cents = iteration_cost_cents + ?,
           updated_at = ?
       WHERE session_id = ? AND user_id = ?`
    ).bind(asInt(inputTokens, 0), asInt(outputTokens, 0), costCents, updates.updated_at, sessionId, userId).run();
  }

  const updated = await getLucSession(env, sessionId);
  return { ok: true, session: updated, costCents };
}

export async function finalizeLucSession(env, sessionId, userId) {
  const check = await assertLucSessionOwner(env, sessionId, userId);
  if (!check.ok) return check;

  const session = check.session;
  if (session.status !== 'active') {
    return { ok: false, status: 400, error: 'Session is not active' };
  }

  const chatTokens = asInt(session.chat_input_tokens, 0) + asInt(session.chat_output_tokens, 0);
  const iterationTokens = asInt(session.iteration_input_tokens, 0) + asInt(session.iteration_output_tokens, 0);

  const chatCostCents = asInt(session.chat_cost_cents, 0);
  const iterationCostCents = asInt(session.iteration_cost_cents, 0);

  // Report positive usage events
  await reportTokenUsage(env, {
    sessionId,
    userId,
    phase: LUC_PHASES.chat,
    model: 'mixed',
    costCents: chatCostCents,
    refunded: false,
  });

  await reportTokenUsage(env, {
    sessionId,
    userId,
    phase: LUC_PHASES.iteration,
    model: 'mixed',
    costCents: iterationCostCents,
    refunded: false,
  });

  let refundCents = 0;
  let totalChargeCents = chatCostCents + iterationCostCents;

  // Refund rule: if iterationTokens >= chatTokens, refund chat
  if (iterationTokens >= chatTokens && chatCostCents > 0) {
    refundCents = chatCostCents;
    totalChargeCents = iterationCostCents;

    // Negative meter event to represent refund
    await reportTokenUsage(env, {
      sessionId,
      userId,
      phase: LUC_PHASES.chat,
      model: 'mixed',
      costCents: -chatCostCents,
      refunded: true,
    });
  }

  const finalizedAt = nowIso();

  await env.DB.prepare(
    `UPDATE luc_sessions
     SET status = 'complete',
         current_phase = 'complete',
         refund_cents = ?,
         total_charge_cents = ?,
         finalized_at = ?,
         updated_at = ?
     WHERE session_id = ? AND user_id = ?`
  ).bind(refundCents, totalChargeCents, finalizedAt, finalizedAt, sessionId, userId).run();

  const receiptId = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO luc_receipts
      (receipt_id, session_id, user_id, chat_tokens, iteration_tokens, chat_cost_cents, iteration_cost_cents, refund_cents, total_charge_cents)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    receiptId,
    sessionId,
    userId,
    chatTokens,
    iterationTokens,
    chatCostCents,
    iterationCostCents,
    refundCents,
    totalChargeCents
  ).run();

  const updated = await getLucSession(env, sessionId);
  return {
    ok: true,
    receipt: {
      receiptId,
      sessionId,
      userId,
      phase: updated.current_phase,
      chatTokens,
      iterationTokens,
      chatCostCents,
      iterationCostCents,
      refundCents,
      totalChargeCents,
      finalizedAt,
    },
  };
}

export function lucErrorResponse(result) {
  return jsonResponse({ error: result.error || 'Unknown error' }, result.status || 500);
}
