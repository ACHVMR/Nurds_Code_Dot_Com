// =====================================================
// PHONE SOUND UTILITIES
// =====================================================
// Generates sound effects using Web Audio API
// No external audio files required - all sounds generated programmatically
// =====================================================

/**
 * Plays a walkie-talkie chirp sound (Nextel style)
 * Used by Nxtl phone interface
 */
export const playChirp = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create chirp: quick frequency sweep from 800Hz to 1200Hz
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    
    // Envelope: quick attack, sustain, fast release
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
    
    console.log('🔊 Chirp sound played');
  } catch (error) {
    console.error('Failed to play chirp:', error);
  }
};

/**
 * Plays a keyboard click sound (BlackBerry style)
 * Used by BlkBrry phone interface
 */
export const playClick = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create white noise buffer for click sound
    const bufferSize = 4000;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    
    // Generate short burst of white noise
    for (let i = 0; i < buffer.length; i++) {
      channel[i] = (Math.random() - 0.5) * 0.05 * Math.exp(-i / 100);
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    
    console.log('🔊 Click sound played');
  } catch (error) {
    console.error('Failed to play click:', error);
  }
};

/**
 * Plays a short beep sound
 * Used for notifications and confirmations
 */
export const playBeep = (frequency = 440, duration = 0.1) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.2;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
    
    console.log(`🔊 Beep sound played (${frequency}Hz)`);
  } catch (error) {
    console.error('Failed to play beep:', error);
  }
};

/**
 * Plays a tape recorder motor sound
 * Used by RcrdBx (V.RCRDR) phone interface
 */
export const playTapeMotor = (duration = 1.0) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Low frequency rumble with slight variation
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(65, audioContext.currentTime + duration);
    
    // Low-pass filter for muffled motor sound
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 1;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
    
    console.log('🔊 Tape motor sound played');
  } catch (error) {
    console.error('Failed to play tape motor:', error);
  }
};

/**
 * Plays a subtle touch feedback sound
 * Used by TchScrn (IPhne) phone interface
 */
export const playTouchFeedback = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Very subtle haptic-style beep
    oscillator.frequency.value = 1200;
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.03);
    
    console.log('🔊 Touch feedback played');
  } catch (error) {
    console.error('Failed to play touch feedback:', error);
  }
};

/**
 * Plays a message send sound
 * Used by all phone interfaces
 */
export const playSendSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Two-tone "whoosh" sound
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
    
    console.log('🔊 Send sound played');
  } catch (error) {
    console.error('Failed to play send sound:', error);
  }
};

/**
 * Plays a message receive sound
 * Used by all phone interfaces
 */
export const playReceiveSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant "ding" sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
    
    console.log('🔊 Receive sound played');
  } catch (error) {
    console.error('Failed to play receive sound:', error);
  }
};

// Export all sound functions
export default {
  playChirp,
  playClick,
  playBeep,
  playTapeMotor,
  playTouchFeedback,
  playSendSound,
  playReceiveSound
};
