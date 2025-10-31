/**
 * Chat handler for Nurds Code onboard assistant
 * Teaches Vibe Coding and mentions upgrade paths
 */

import { generateForUser } from './llm.js';

const assistantHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const MODEL_BY_PLAN = {
  free: 'llama3-8b-instant',
  coffee: 'llama3-70b-8192',
  pro: 'gpt-4o-mini',
  enterprise: 'claude-3-opus-20240229',
};

const PLAN_ALIASES = {
  price_coffee: 'coffee',
  price_pro: 'pro',
  price_enterprise: 'enterprise',
};

function resolvePlan(plan) {
  if (!plan) return 'free';
  const normalized = PLAN_ALIASES[plan] || plan;
  return MODEL_BY_PLAN[normalized] ? normalized : 'free';
}

function buildSystemPrompt(plan) {
  return `You are the Nurds Code onboard assistant. Your role is to:
- Teach users about Vibe Coding step-by-step
- Help them understand the platform features
- Always mention the current model being used
- Offer upgrade suggestions when relevant (e.g., for better reasoning, faster responses, or advanced features)

Current user plan: ${plan}
Available models:
- Free: GROQ 8B (fast, good for learning)
- Coffee ($7/mo): GROQ 70B (stronger coding abilities)
- Pro ($29/mo): GPT-4o mini (balanced quality/cost)
- Enterprise ($99/mo): Claude mix (long-context, safety)

Be concise, helpful, and encouraging.`;
}

function formatConversationHistory(history = []) {
  if (!Array.isArray(history) || history.length === 0) {
    return '';
  }

  return history
    .filter((turn) => turn && typeof turn.content === 'string' && turn.content.trim())
    .map((turn) => {
      const speaker = turn.role === 'assistant' ? 'Assistant' : 'User';
      return `${speaker}: ${turn.content.trim()}`;
    })
    .join('\n');
}

export function buildAssistantPrompt(user = {}, message, history = []) {
  const plan = resolvePlan(user.plan);
  const systemPrompt = buildSystemPrompt(plan);
  const conversation = formatConversationHistory(history);
  const conversationSection = conversation
    ? `Conversation so far:\n${conversation}\n\n`
    : '';

  return `${systemPrompt}\n\n${conversationSection}User: ${message}`;
}

export function extractAssistantPayload(rawResponse) {
  if (!rawResponse) {
    return { message: '', model: null, usage: null };
  }

  let message = '';

  if (Array.isArray(rawResponse.choices) && rawResponse.choices.length > 0) {
    const choice = rawResponse.choices[0];
    const content = choice?.message?.content ?? choice?.delta?.content;

    if (Array.isArray(content)) {
      message = content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (typeof part?.text === 'string') return part.text;
          return '';
        })
        .join('');
    } else if (typeof content === 'string') {
      message = content;
    }
  } else if (typeof rawResponse.output_text === 'string') {
    message = rawResponse.output_text;
  } else if (Array.isArray(rawResponse.content) && rawResponse.content.length > 0) {
    message = rawResponse.content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        if (part?.data && typeof part.data.text === 'string') return part.data.text;
        return '';
      })
      .join('');
  } else if (typeof rawResponse.response === 'string') {
    message = rawResponse.response;
  }

  const trimmedMessage = message?.trim() ?? '';

  return {
    message: trimmedMessage,
    model: rawResponse.model ?? rawResponse.id ?? null,
    usage: rawResponse.usage ?? null,
  };
}

/**
 * Handle chat requests from the onboard assistant
 * @param {Request} req - Request object
 * @param {object} env - Environment variables
 * @param {object} overrides - Optional overrides for user data
 * @returns {Promise<Response>} - Response with assistant reply
 */
export async function chatHandler(req, env, overrides = {}) {
  try {
    const { message, history = [], plan, userId, debug } = await req.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'A question or message is required.' }),
        { status: 400, headers: assistantHeaders }
      );
    }

    const resolvedPlan = resolvePlan(plan || overrides.plan || 'free');
    const user = {
      ...overrides,
      plan: resolvedPlan,
      userId: overrides.userId || userId || 'anonymous',
    };

    const fullPrompt = buildAssistantPrompt(user, message, history);
    const rawResponse = await generateForUser(user, fullPrompt, env);
    const { message: assistantMessage, model, usage } = extractAssistantPayload(rawResponse);

    if (!assistantMessage) {
      throw new Error('Assistant returned an empty response. Please try again.');
    }

    try {
      await saveChatHistory(env, user.userId, message, assistantMessage);
    } catch (dbError) {
      console.warn('Unable to persist chat history:', dbError);
    }

    const responsePayload = {
      message: assistantMessage,
      plan: user.plan,
      model: model ?? MODEL_BY_PLAN[user.plan],
      usage: usage,
    };

    if (debug) {
      responsePayload.raw = rawResponse;
    }

    return new Response(JSON.stringify(responsePayload), {
      headers: assistantHeaders,
    });
  } catch (error) {
    console.error('Chat handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Assistant unavailable. Please try again.' }),
      {
        status: 500,
        headers: assistantHeaders,
      }
    );
  }
}

/**
 * Save chat history to D1 database
 * @param {object} env - Environment with DB binding
 * @param {string} userId - User ID
 * @param {string} message - User message
 * @param {string} response - Assistant response
 * @returns {Promise<void>}
 */
export async function saveChatHistory(env, userId, message, response) {
  if (!env?.DB || typeof env.DB.prepare !== 'function') {
    return;
  }

  await env.DB.prepare(
    'INSERT INTO chat_history (user_id, message, response, created_at) VALUES (?, ?, ?, ?)'
  )
    .bind(userId, message, response, new Date().toISOString())
    .run();
}

export { MODEL_BY_PLAN };
