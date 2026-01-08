/**
 * Kie.ai API Integration Service
 * Provides video generation, image creation, and file upload capabilities
 * 
 * API Key: 6423cd116ad6e1e3f43f3506aaf4b751
 * Base URL: https://api.kie.ai
 * 
 * Supported Features:
 * - From Audio (image + audio → video)
 * - Veo3.1 (text → video)
 * - Runway (image → video)
 * - Suno V4 (text → music)
 * - File Upload (images, audio)
 */

import { fetchAuthed } from '../utils/fetchAuthed.js';

// Use worker proxy to avoid CORS issues
const WORKER_PROXY_URL = '/api/kieai';

// Fallback to direct API for local dev
const KIE_API_KEY = import.meta.env.VITE_KIE_API_KEY || '6423cd116ad6e1e3f43f3506aaf4b751';
const KIE_BASE_URL = 'https://api.kie.ai/api/v1';

// Task polling interval (ms)
const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 100; // 5 minutes max

/**
 * Upload file to Kie.ai storage
 * @param {File} file - File object from input
 * @param {string} type - File type ('image' or 'audio')
 * @returns {Promise<{url: string}>}
 */
export async function uploadFile(file, type = 'image') {
  const formData = new FormData();
  formData.append('file', file);
  
  // Use worker proxy
  const response = await fetchAuthed(`${WORKER_PROXY_URL}/files/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || `Upload failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    url: data.data?.url || data.url
  };
}

/**
 * Create From Audio video generation task
 * @param {Object} params
 * @param {string} params.imageUrl - URL of the input image
 * @param {string} params.audioUrl - URL of the audio file
 * @param {string} params.prompt - Text prompt for video generation
 * @param {string} params.resolution - '480p' or '720p'
 * @param {number} params.seed - Random seed (10000-1000000)
 * @param {string} params.callbackUrl - Optional callback URL
 * @returns {Promise<{taskId: string}>}
 */
export async function createFromAudioTask(params) {
  const {
    imageUrl,
    audioUrl,
    prompt,
    resolution = '480p',
    seed,
    callbackUrl
  } = params;

  // Use worker proxy
  const response = await fetchAuthed(`${WORKER_PROXY_URL}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'infinitalk/from-audio',
      input: {
        image_url: imageUrl,
        audio_url: audioUrl,
        prompt,
        resolution,
        ...(seed && { seed })
      },
      ...(callbackUrl && { callBackUrl: callbackUrl })
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || `Task creation failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    taskId: data.data?.taskId || data.taskId
  };
}

/**
 * Query task status
 * @param {string} taskId - Task ID from createTask response
 * @returns {Promise<Object>}
 */
export async function queryTaskStatus(taskId) {
  // Use worker proxy
  const response = await fetchAuthed(
    `${WORKER_PROXY_URL}/jobs/recordInfo?taskId=${taskId}`
  );

  if (!response.ok) {
    throw new Error(`Query failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Poll task until completion or timeout
 * @param {string} taskId
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<{state: string, resultUrls?: string[], error?: string}>}
 */
export async function pollTaskUntilComplete(taskId, onProgress) {
  let attempts = 0;

  while (attempts < MAX_POLL_ATTEMPTS) {
    const status = await queryTaskStatus(taskId);
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress({
        state: status.state,
        attempt: attempts + 1,
        maxAttempts: MAX_POLL_ATTEMPTS
      });
    }

    // Success - return results
    if (status.state === 'success') {
      const result = JSON.parse(status.resultJson);
      return {
        state: 'success',
        resultUrls: result.resultUrls || [],
        costTime: status.costTime,
        completeTime: status.completeTime
      };
    }

    // Failure - return error
    if (status.state === 'fail') {
      return {
        state: 'fail',
        error: status.failMsg || 'Task failed',
        failCode: status.failCode
      };
    }

    // Still waiting - continue polling
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    attempts++;
  }

  // Timeout
  throw new Error('Task polling timeout after 5 minutes');
}

/**
 * High-level: Upload image + audio, generate video
 * @param {File} imageFile - Image file
 * @param {File} audioFile - Audio file
 * @param {string} prompt - Generation prompt
 * @param {Object} options - Additional options
 * @returns {Promise<{videoUrl: string}>}
 */
export async function generateVideoFromMedia(imageFile, audioFile, prompt, options = {}) {
  try {
    // 1. Upload image
    const imageUpload = await uploadFile(imageFile, 'image');
    
    // 2. Upload audio
    const audioUpload = await uploadFile(audioFile, 'audio');
    
    // 3. Create generation task
    const task = await createFromAudioTask({
      imageUrl: imageUpload.url,
      audioUrl: audioUpload.url,
      prompt,
      resolution: options.resolution || '720p',
      seed: options.seed,
      callbackUrl: options.callbackUrl
    });

    // 4. Poll until complete
    const result = await pollTaskUntilComplete(task.taskId, options.onProgress);

    if (result.state === 'fail') {
      throw new Error(result.error);
    }

    return {
      videoUrl: result.resultUrls[0],
      taskId: task.taskId,
      costTime: result.costTime
    };
  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}

/**
 * Generate video from uploaded image URL and audio URL
 * (Skip upload step if URLs already available)
 */
export async function generateVideoFromUrls(imageUrl, audioUrl, prompt, options = {}) {
  const task = await createFromAudioTask({
    imageUrl,
    audioUrl,
    prompt,
    resolution: options.resolution || '720p',
    seed: options.seed,
    callbackUrl: options.callbackUrl
  });

  const result = await pollTaskUntilComplete(task.taskId, options.onProgress);

  if (result.state === 'fail') {
    throw new Error(result.error);
  }

  return {
    videoUrl: result.resultUrls[0],
    taskId: task.taskId,
    costTime: result.costTime
  };
}

/**
 * React hook for video generation
 */
export function useKieAIVideoGeneration() {
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);

  const generateVideo = async (imageFile, audioFile, prompt, options = {}) => {
    setLoading(true);
    setError(null);
    setProgress({ state: 'uploading', message: 'Uploading files...' });

    try {
      const videoResult = await generateVideoFromMedia(
        imageFile,
        audioFile,
        prompt,
        {
          ...options,
          onProgress: (progressData) => {
            setProgress({
              state: progressData.state,
              message: `Generating video... (${progressData.attempt}/${progressData.maxAttempts})`,
              attempt: progressData.attempt,
              maxAttempts: progressData.maxAttempts
            });
          }
        }
      );

      setResult(videoResult);
      setProgress({ state: 'complete', message: 'Video generated successfully!' });
      return videoResult;
    } catch (err) {
      setError(err.message);
      setProgress(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateVideo,
    loading,
    progress,
    error,
    result
  };
}

/**
 * Error codes reference
 */
export const KIE_ERROR_CODES = {
  200: 'Success',
  400: 'Invalid request parameters',
  401: 'Authentication failed - check API key',
  402: 'Insufficient account balance',
  404: 'Resource not found',
  422: 'Parameter validation failed',
  429: 'Rate limit exceeded',
  500: 'Internal server error'
};

/**
 * Supported file formats
 */
export const SUPPORTED_FORMATS = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/ogg']
};

/**
 * Max file sizes (bytes)
 */
export const MAX_FILE_SIZE = {
  image: 10 * 1024 * 1024, // 10MB
  audio: 10 * 1024 * 1024  // 10MB
};
