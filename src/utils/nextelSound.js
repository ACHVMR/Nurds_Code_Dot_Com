/**
 * Nextel-Style Chirp Sound Generator
 * Uses Web Audio API to create authentic push-to-talk chirp sounds
 * 
 * Classic Nextel chirp characteristics:
 * - Dual-tone frequency (850Hz + 1200Hz)
 * - Very short duration (~150ms)
 * - Quick attack, sharp decay
 * - Distinctive "beep-boop" quality
 */

class NextelChirp {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      // Create AudioContext (modern browsers)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  /**
   * Play Nextel-style chirp (start transmission)
   * Higher pitch, quick rising tone
   */
  playStartChirp() {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Create oscillators for dual-tone effect
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Connect nodes
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Nextel "start" chirp frequencies
    oscillator1.frequency.setValueAtTime(850, now);  // Lower tone
    oscillator2.frequency.setValueAtTime(1200, now); // Higher tone
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';

    // Envelope (ADSR)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // Sharp decay

    // Play the chirp
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 0.15);
    oscillator2.stop(now + 0.15);
  }

  /**
   * Play Nextel-style chirp (end transmission)
   * Lower pitch, quick falling tone
   */
  playEndChirp() {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Create oscillators for dual-tone effect
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Connect nodes
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Nextel "end" chirp frequencies (reversed - lower)
    oscillator1.frequency.setValueAtTime(650, now);  // Lower tone
    oscillator2.frequency.setValueAtTime(900, now);  // Mid tone
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';

    // Envelope (ADSR)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12); // Sharp decay

    // Play the chirp
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 0.12);
    oscillator2.stop(now + 0.12);
  }

  /**
   * Play message received chirp
   * Quick double-beep
   */
  playMessageChirp() {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // First beep
    this.playBeep(now, 1000, 0.08);
    // Second beep (slightly delayed)
    this.playBeep(now + 0.1, 1000, 0.08);
  }

  /**
   * Helper function to play a single beep
   */
  playBeep(startTime, frequency, duration) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * Toggle chirp sounds on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Set enabled state
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
export const nextelChirp = new NextelChirp();

// Export class for testing
export default NextelChirp;
