/**
 * ============================================
 * Kie.ai Proxy Routes - Video Generation
 * ============================================
 * 
 * Proxies requests to Kie.ai API to avoid CORS issues
 * Supports file uploads and video generation
 */

import { Router } from 'itty-router';
import { jsonResponse } from '../utils/responses.js';
import { badRequest, serverError } from '../utils/errors.js';

export const kieaiRouter = Router({ base: '/api/kieai' });

// Kie.ai API Configuration
const KIEAI_BASE_URL = 'https://api.kie.ai';
const KIEAI_API_VERSION = 'v1';

/**
 * Get API key from environment
 */
function getApiKey(env) {
  const key = env.KIE_API_KEY;
  if (!key) {
    throw new Error('KIE_API_KEY is not configured');
  }
  return key;
}

/**
 * POST /api/kieai/jobs/createTask - Create video generation task
 */
kieaiRouter.post('/jobs/createTask', async (request, env) => {
  try {
    const body = await request.json();
    const apiKey = getApiKey(env);

    const response = await fetch(`${KIEAI_BASE_URL}/${KIEAI_API_VERSION}/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return jsonResponse(data, response.status);
  } catch (error) {
    console.error('[Kie.ai] createTask error:', error);
    return serverError('Failed to create task: ' + error.message);
  }
});

/**
 * GET /api/kieai/jobs/recordInfo - Query task status
 */
kieaiRouter.get('/jobs/recordInfo', async (request, env) => {
  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return badRequest('taskId is required');
    }

    const apiKey = getApiKey(env);

    const response = await fetch(
      `${KIEAI_BASE_URL}/${KIEAI_API_VERSION}/jobs/recordInfo?taskId=${taskId}`,
      {
        method: 'GET',
        headers: {
          'api-key': apiKey,
        },
      }
    );

    const data = await response.json();
    return jsonResponse(data, response.status);
  } catch (error) {
    console.error('[Kie.ai] recordInfo error:', error);
    return serverError('Failed to query task: ' + error.message);
  }
});

/**
 * POST /api/kieai/files/upload - Upload file to Kie.ai storage
 */
kieaiRouter.post('/files/upload', async (request, env) => {
  try {
    const formData = await request.formData();
    const apiKey = getApiKey(env);

    const response = await fetch(`${KIEAI_BASE_URL}/${KIEAI_API_VERSION}/files/upload`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
      },
      body: formData,
    });

    const data = await response.json();
    return jsonResponse(data, response.status);
  } catch (error) {
    console.error('[Kie.ai] upload error:', error);
    return serverError('Failed to upload file: ' + error.message);
  }
});

/**
 * POST /api/kieai/generate-video - Full video generation flow
 * 
 * Convenience endpoint that handles:
 * 1. Upload image (if base64)
 * 2. Upload audio (if base64)
 * 3. Create task
 * 4. Poll for completion
 * 5. Return video URL
 */
kieaiRouter.post('/generate-video', async (request, env) => {
  try {
    const body = await request.json();
    const { image, audio, prompt, resolution = '720p', seed } = body;

    if (!image || !audio) {
      return badRequest('Both image and audio are required');
    }

    const apiKey = getApiKey(env);

    // Step 1: Upload image if base64
    let imageUrl = image;
    if (image.startsWith('data:') || !image.startsWith('http')) {
      imageUrl = await uploadBase64File(image, 'image', apiKey);
    }

    // Step 2: Upload audio if base64
    let audioUrl = audio;
    if (audio.startsWith('data:') || !audio.startsWith('http')) {
      audioUrl = await uploadBase64File(audio, 'audio', apiKey);
    }

    // Step 3: Create task
    const createResponse = await fetch(`${KIEAI_BASE_URL}/${KIEAI_API_VERSION}/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'infinitalk/from-audio',
        input: {
          image_url: imageUrl,
          audio_url: audioUrl,
          prompt: prompt || 'A person speaking naturally',
          resolution,
          ...(seed && { seed }),
        },
      }),
    });

    const createData = await createResponse.json();

    if (createData.code !== 200 || !createData.data?.taskId) {
      return serverError('Failed to create video task: ' + JSON.stringify(createData));
    }

    const taskId = createData.data.taskId;

    // Step 4: Poll for completion (max 5 minutes)
    const maxAttempts = 60; // 5 seconds * 60 = 5 minutes
    const pollInterval = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await fetch(
        `${KIEAI_BASE_URL}/${KIEAI_API_VERSION}/jobs/recordInfo?taskId=${taskId}`,
        {
          headers: { 'api-key': apiKey },
        }
      );

      const statusData = await statusResponse.json();

      if (statusData.data?.status === 'completed') {
        return jsonResponse({
          success: true,
          taskId,
          videoUrl: statusData.data.output?.video_url,
          costTime: statusData.data.costTime,
          attempts: attempt + 1,
        });
      }

      if (statusData.data?.status === 'failed') {
        return serverError('Video generation failed: ' + statusData.data.error);
      }
    }

    // Timeout - return task ID for manual polling
    return jsonResponse({
      success: false,
      taskId,
      message: 'Video generation is still in progress. Poll /api/kieai/jobs/recordInfo?taskId=' + taskId,
      timeout: true,
    }, 202);
  } catch (error) {
    console.error('[Kie.ai] generate-video error:', error);
    return serverError('Video generation failed: ' + error.message);
  }
});

/**
 * Upload base64 file to Kie.ai
 */
async function uploadBase64File(base64Data, type, apiKey) {
  let data, mimeType;

  if (base64Data.startsWith('data:')) {
    const [header, content] = base64Data.split(',');
    mimeType = header.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
    data = content;
  } else {
    mimeType = type === 'image' ? 'image/png' : 'audio/mp3';
    data = base64Data;
  }

  const binaryData = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  const extension = mimeType.split('/')[1] || (type === 'image' ? 'png' : 'mp3');
  const filename = `upload_${Date.now()}.${extension}`;

  const formData = new FormData();
  formData.append('file', new Blob([binaryData], { type: mimeType }), filename);

  const response = await fetch(`${KIEAI_BASE_URL}/v1/files/upload`, {
    method: 'POST',
    headers: { 'api-key': apiKey },
    body: formData,
  });

  const result = await response.json();
  return result.data?.url || result.url;
}

/**
 * GET /api/kieai/models - List available models
 */
kieaiRouter.get('/models', async (request, env) => {
  return jsonResponse({
    models: [
      {
        id: 'infinitalk/from-audio',
        name: 'From Audio',
        description: 'Generate video from image + audio',
        inputTypes: ['image', 'audio'],
        outputType: 'video',
      },
      {
        id: 'veo3.1',
        name: 'Veo 3.1',
        description: 'Google video generation model',
        inputTypes: ['text', 'image'],
        outputType: 'video',
      },
      {
        id: 'runway-gen4',
        name: 'Runway Gen-4',
        description: 'Runway video generation',
        inputTypes: ['text', 'image'],
        outputType: 'video',
      },
    ],
    timestamp: new Date().toISOString(),
  });
});

export default kieaiRouter;
