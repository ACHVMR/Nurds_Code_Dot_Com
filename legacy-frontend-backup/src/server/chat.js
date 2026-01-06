/**
 * Chat handler for Nurds Code onboard assistant
 * Teaches Vibe Coding and mentions upgrade paths
 */

import { generateForUser } from './llm.js';

/**
 * Handle chat requests from the onboard assistant
 * @param {Request} req - Request object
 * @param {object} env - Environment variables
 * @param {object} user - User object with plan information
 * @returns {Promise<Response>} - Response with assistant reply
 */
export async function chatHandler(req, env, user) {
  try {
    const { message } = await req.json();

    // System prompt for the onboard assistant
    const systemPrompt = `You are the Nurds Code onboard assistant. Your role is to:
- Teach users about Vibe Coding step-by-step
- Help them understand the platform features
- Always mention the current model being used
- Offer upgrade suggestions when relevant (e.g., for better reasoning, faster responses, or advanced features)

Current user plan: ${user.plan || 'free'}
Available models:
- Free: GROQ 8B (fast, good for learning)
- Coffee ($7/mo): GROQ 70B (stronger coding abilities)
- Pro ($29/mo): GPT-4o mini (balanced quality/cost)
- Enterprise ($99/mo): Claude mix (long-context, safety)

Be concise, helpful, and encouraging.`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

    // Generate response using the user's plan tier
    const response = await generateForUser(user, fullPrompt, env);

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Chat handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
  await env.DB.prepare(
    'INSERT INTO chat_history (user_id, message, response, created_at) VALUES (?, ?, ?, ?)'
  )
    .bind(userId, message, response, new Date().toISOString())
    .run();
}
