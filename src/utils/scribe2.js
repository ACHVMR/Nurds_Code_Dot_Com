/**
 * Scribe2 SDK
 * Handles voice recording, silence detection, and transcription via the Nurds Code API.
 */

class Scribe2 {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  /**
   * Request microphone access and start recording
   */
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error('Scribe2: Microphone access denied', error);
      return false;
    }
  }

  /**
   * Stop recording and return the audio blob
   */
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) resolve(null);

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        this.isRecording = false;
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  /**
   * Send audio to backend for transcription
   * @param {Blob} audioBlob 
   */
  async transcribe(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('provider', 'openai'); // Default to OpenAI Whisper

    try {
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Transcription failed');
      
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Scribe2: Transcription error', error);
      return null;
    }
  }
}

export const scribe2 = new Scribe2();
export default scribe2;
