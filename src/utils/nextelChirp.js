/**
 * Nextel Chirp Sound Generator
 * Generates authentic Nextel-style chirp sounds using Web Audio API
 * 
 * The classic Nextel chirp is a short, distinctive two-tone beep
 * - First tone: ~1400Hz for ~100ms
 * - Second tone: ~800Hz for ~150ms
 * - Quick attack, short sustain
 */

class NextelChirpGenerator {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.6; // Default volume
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Generate classic Nextel chirp sound
   * Two-tone beep: high-low pattern
   */
  playChirp(type = 'open') {
    if (!this.enabled) return;

    try {
      const ctx = this.init();
      const currentTime = ctx.currentTime;

      // Create oscillator for tones
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Configure chirp type
      let frequencies, durations;
      
      switch(type) {
        case 'open':
        case 'close':
          // Classic Nextel "Direct Connect" chirp
          // Two tones: High then Low (like "bee-boop")
          frequencies = [1400, 800]; // Hz
          durations = [0.1, 0.15]; // seconds
          break;
        
        case 'message':
          // Incoming message chirp (reverse pattern)
          frequencies = [800, 1200]; // Hz
          durations = [0.12, 0.12]; // seconds
          break;
        
        case 'error':
          // Error/busy chirp (lower tones)
          frequencies = [600, 400]; // Hz
          durations = [0.15, 0.15]; // seconds
          break;
        
        default:
          frequencies = [1400, 800];
          durations = [0.1, 0.15];
      }

      // Set oscillator type (square wave for that classic digital sound)
      oscillator.type = 'square';

      // Create envelope (quick attack, short sustain, quick release)
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, currentTime + 0.005); // Quick attack

      // First tone
      oscillator.frequency.setValueAtTime(frequencies[0], currentTime);
      
      // Second tone (immediate transition)
      oscillator.frequency.setValueAtTime(frequencies[1], currentTime + durations[0]);

      // Release/fade out
      const totalDuration = durations[0] + durations[1];
      gainNode.gain.setValueAtTime(this.volume, currentTime + totalDuration - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + totalDuration);

      // Start and stop
      oscillator.start(currentTime);
      oscillator.stop(currentTime + totalDuration);

      // Cleanup
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };

    } catch (error) {
      console.warn('Chirp sound failed:', error);
    }
  }

  /**
   * Play push-to-talk chirp (immediate, shorter)
   */
  playPTT() {
    if (!this.enabled) return;

    try {
      const ctx = this.init();
      const currentTime = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Single short beep for PTT
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(1200, currentTime);

      // Very quick envelope
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, currentTime + 0.003);
      gainNode.gain.setValueAtTime(this.volume, currentTime + 0.08);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.1);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.1);

      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };

    } catch (error) {
      console.warn('PTT chirp failed:', error);
    }
  }

  /**
   * Play release/end chirp (when releasing PTT button)
   */
  playRelease() {
    if (!this.enabled) return;

    try {
      const ctx = this.init();
      const currentTime = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Single lower tone for release
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(700, currentTime);

      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, currentTime + 0.003);
      gainNode.gain.setValueAtTime(this.volume * 0.8, currentTime + 0.06);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.08);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.08);

      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };

    } catch (error) {
      console.warn('Release chirp failed:', error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Toggle sounds on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Create singleton instance
const nextelChirp = new NextelChirpGenerator();

// Export both the instance and class
export default nextelChirp;
export { NextelChirpGenerator };
