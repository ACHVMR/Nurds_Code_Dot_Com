/**
 * AI/ML API Usage Examples
 * Shows how to use the unified AI/ML API client
 * NO OpenAI models - using alternatives as per user request
 */

import {
  chatCompletion,
  generateImage,
  textToSpeech,
  speechToText,
  generateVideo,
  generateMusic,
  RECOMMENDED_MODELS,
  AI_PROVIDERS
} from '../utils/aimlapi';

// =============================================================================
// Example 1: Chat with DeepSeek (DEFAULT - Fast & Smart)
// =============================================================================
export async function exampleChat() {
  try {
    const response = await chatCompletion({
      // No model specified = uses CHAT_DEFAULT (deepseek-chat) ⭐
      messages: [
        { role: 'system', content: 'You are ACHEEVY, a helpful coding assistant.' },
        { role: 'user', content: 'Explain React hooks in simple terms' }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('AI Response:', response.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('Chat error:', error);
  }
}

// =============================================================================
// Example 2: Streaming Chat with DeepSeek (Real-time responses)
// =============================================================================
export async function exampleStreamingChat() {
  try {
    const response = await chatCompletion({
      // Uses default DeepSeek for streaming
      messages: [
        { role: 'user', content: 'Write a React component for a button' }
      ],
      stream: true
    });

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              console.log(content); // Print token-by-token
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
  }
}

// =============================================================================
// Example 3: Generate Image with Flux
// =============================================================================
export async function exampleImageGeneration() {
  try {
    const response = await generateImage({
      model: RECOMMENDED_MODELS.IMAGE_QUALITY, // flux/pro
      prompt: 'A futuristic coding workspace with neon golden accents, cyberpunk style',
      width: 1024,
      height: 1024,
      steps: 20
    });

    console.log('Generated Image URL:', response.data[0].url);
    return response.data[0].url;
  } catch (error) {
    console.error('Image generation error:', error);
  }
}

// =============================================================================
// Example 4: Voice Transcription (Groq Whisper)
// =============================================================================
export async function exampleVoiceTranscription(audioBlob) {
  try {
    const response = await speechToText(audioBlob, RECOMMENDED_MODELS.VOICE_STT);
    
    console.log('Transcription:', response.text);
    return response.text;
  } catch (error) {
    console.error('Transcription error:', error);
  }
}

// =============================================================================
// Example 5: Text-to-Speech (ElevenLabs)
// =============================================================================
export async function exampleTextToSpeech() {
  try {
    const audioBlob = await textToSpeech({
      text: 'Welcome to Nurds Code! Let me help you build something amazing.',
      voice_id: 'rachel', // Professional female voice
      model_id: RECOMMENDED_MODELS.VOICE_TTS
    });

    // Create audio URL and play
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();

    return audioUrl;
  } catch (error) {
    console.error('TTS error:', error);
  }
}

// =============================================================================
// Example 6: Code Generation (DeepSeek Coder)
// =============================================================================
export async function exampleCodeGeneration() {
  try {
    const response = await chatCompletion({
      model: RECOMMENDED_MODELS.CHAT_CODING, // deepseek-coder
      messages: [
        {
          role: 'user',
          content: 'Write a React hook that manages voice recording with start/stop/pause functionality'
        }
      ],
      temperature: 0.3, // Lower for more precise code
      max_tokens: 1000
    });

    console.log('Generated Code:', response.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('Code generation error:', error);
  }
}

// =============================================================================
// Example 6b: GLM-4 Plus Chat (Latest Zhipu AI model)
// =============================================================================
export async function exampleGLMChat() {
  try {
    const response = await chatCompletion({
      model: RECOMMENDED_MODELS.GLM_CHAT, // glm-4-plus
      messages: [
        { role: 'system', content: 'You are ACHEEVY, a helpful AI assistant.' },
        { role: 'user', content: 'What are the key features of modern web development?' }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    console.log('GLM Response:', response.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('GLM chat error:', error);
  }
}

// =============================================================================
// Example 6c: GLM-4V Plus Vision (Image + Chat)
// =============================================================================
export async function exampleGLMVision() {
  try {
    const response = await chatCompletion({
      model: RECOMMENDED_MODELS.GLM_VISION, // glm-4v-plus
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What do you see in this image?' },
            { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('GLM Vision Response:', response.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('GLM vision error:', error);
  }
}

// =============================================================================
// Example 6d: GLM-4 Long (1M Context Window)
// =============================================================================
export async function exampleGLMLongContext() {
  try {
    const longDocument = `[Insert very long document here - up to 1M tokens]`;
    
    const response = await chatCompletion({
      model: RECOMMENDED_MODELS.GLM_LONG, // glm-4-long
      messages: [
        { role: 'user', content: `Summarize this document:\n\n${longDocument}` }
      ],
      temperature: 0.5,
      max_tokens: 2000
    });

    console.log('GLM Long Context Summary:', response.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('GLM long context error:', error);
  }
}

// =============================================================================
// Example 6e: DeepSeek Reasoner (Advanced Reasoning)
// =============================================================================
export async function exampleDeepSeekReasoning() {
  try {
    const response = await chatCompletion({
      model: RECOMMENDED_MODELS.CHAT_REASONING, // deepseek-reasoner (R1)
      messages: [
        {
          role: 'user',
          content: 'Solve this problem step by step: If a train travels 120km in 2 hours, then stops for 30 minutes, then travels another 180km in 3 hours, what is its average speed for the entire journey?'
        }
      ],
      temperature: 0.4,
      max_tokens: 1500
    });

    console.log('Reasoning Response:', response.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('Reasoning error:', error);
  }
}

// =============================================================================
// Example 7: Video Generation (Kling AI)
// =============================================================================
export async function exampleVideoGeneration() {
  try {
    const response = await generateVideo({
      prompt: 'A smooth camera pan across a futuristic coding workspace with golden neon lights',
      model: RECOMMENDED_MODELS.VIDEO_FAST,
      duration: 5
    });

    console.log('Generated Video URL:', response.data[0].url);
    return response;
  } catch (error) {
    console.error('Video generation error:', error);
  }
}

// =============================================================================
// Example 8: Music Generation (Stable Audio)
// =============================================================================
export async function exampleMusicGeneration() {
  try {
    const response = await generateMusic({
      prompt: 'Upbeat electronic coding music with synthesizers, 120 BPM',
      duration: 30
    });

    console.log('Generated Music URL:', response.data[0].url);
    return response;
  } catch (error) {
    console.error('Music generation error:', error);
  }
}

// =============================================================================
// Example 9: Multi-turn Conversation with Context
// =============================================================================
export async function exampleConversation() {
  const conversationHistory = [
    { role: 'system', content: 'You are ACHEEVY, a voice-first AI coding assistant.' }
  ];

  try {
    // First message
    conversationHistory.push({
      role: 'user',
      content: 'I want to build a voice-controlled app'
    });

    let response = await chatCompletion({
      model: RECOMMENDED_MODELS.CHAT_SMART,
      messages: conversationHistory
    });

    conversationHistory.push({
      role: 'assistant',
      content: response.choices[0].message.content
    });

    console.log('AI:', response.choices[0].message.content);

    // Follow-up message
    conversationHistory.push({
      role: 'user',
      content: 'What technologies should I use?'
    });

    response = await chatCompletion({
      model: RECOMMENDED_MODELS.CHAT_SMART,
      messages: conversationHistory
    });

    console.log('AI:', response.choices[0].message.content);

    return conversationHistory;
  } catch (error) {
    console.error('Conversation error:', error);
  }
}

// =============================================================================
// Example 10: Function Calling (Advanced)
// =============================================================================
export async function exampleFunctionCalling() {
  try {
    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Get the current weather in a location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA'
              }
            },
            required: ['location']
          }
        }
      }
    ];

    const response = await chatCompletion({
      model: RECOMMENDED_MODELS.CHAT_SMART,
      messages: [
        { role: 'user', content: 'What\'s the weather in New York?' }
      ],
      tools,
      tool_choice: 'auto'
    });

    console.log('Function Call:', response.choices[0].message.tool_calls);
    return response;
  } catch (error) {
    console.error('Function calling error:', error);
  }
}

// Export all examples
export default {
  // Core examples
  exampleChat,
  exampleStreamingChat,
  exampleImageGeneration,
  exampleVoiceTranscription,
  exampleTextToSpeech,
  exampleCodeGeneration,
  exampleVideoGeneration,
  exampleMusicGeneration,
  exampleConversation,
  exampleFunctionCalling,
  
  // GLM & DeepSeek specialized examples
  exampleGLMChat,
  exampleGLMVision,
  exampleGLMLongContext,
  exampleDeepSeekReasoning
};
