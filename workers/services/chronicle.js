/**
 * Common_Chronicle (Proof-of-Benefit) logging
 *
 * Stores audit events in D1 for verifiable usage.
 */

function toIntOrNull(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return null;
  return Math.floor(numberValue);
}

export async function logChronicleEvent(env, {
  userId,
  eventType,
  goal = null,
  scoutSourcesCount = null,
  scoutBytes = null,
  chatMessagesCount = null,
  stage = null,
  modelUsed = null,
  tokensSaved = null,
  metadata = null,
  timestamp = null,
}) {
  if (!env?.DB) throw new Error('DB binding not available');
  if (!userId) throw new Error('userId is required');
  if (!eventType) throw new Error('eventType is required');

  const id = crypto.randomUUID();
  const createdAt = typeof timestamp === 'string' && timestamp.trim() ? timestamp.trim() : new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO chronicle_events (
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      userId,
      eventType,
      goal,
      toIntOrNull(scoutSourcesCount),
      toIntOrNull(scoutBytes),
      toIntOrNull(chatMessagesCount),
      stage,
      modelUsed,
      toIntOrNull(tokensSaved),
      metadata ? JSON.stringify(metadata) : null,
      createdAt
    )
    .run();

  return { id, created_at: createdAt };
}
