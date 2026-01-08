/**
 * Audio Library for NURDS CODE
 * Provides notification sounds for chat and UI events
 * Users can customize which sounds play for different events
 */

// Audio Library - All sounds generated with Web Audio API
const AudioLibrary = {
  // Session notifications
  sessionTone: {
    name: 'Session Tone',
    category: 'notifications',
    description: 'Dual-tone session notification',
    generate: (volume = 0.3) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const merger = audioContext.createChannelMerger(2);
      
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 850;
      osc2.frequency.value = 1200;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + 0.05);
      gainNode.gain.setValueAtTime(volume * 0.7, now + 0.12);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(merger, 0, 0);
      gainNode.connect(merger, 0, 1);
      merger.connect(audioContext.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
    }
  },

  // Recording cues
  recordStart: {
    name: 'Record Start',
    category: 'ui',
    description: 'Start recording cue (ascending)',
    generate: (volume = 0.3) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1300, now + 0.08);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.08);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.08);
    }
  },

  recordStop: {
    name: 'Record Stop',
    category: 'ui',
    description: 'Stop recording cue (descending)',
    generate: (volume = 0.3) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1300, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.08);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.08);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.08);
    }
  },

  // Message notifications
  messageReceived: {
    name: 'Message Pop',
    category: 'notifications',
    description: 'Soft notification for incoming messages',
    generate: (volume = 0.3) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 880;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.15);
    }
  },

  messageSent: {
    name: 'Send Whoosh',
    category: 'notifications',
    description: 'Confirmation sound for sent messages',
    generate: (volume = 0.3) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(660, now + 0.12);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume * 0.8, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.12);
    }
  },

  // Alert sounds
  alertSuccess: {
    name: 'Success Chime',
    category: 'alerts',
    description: 'Positive feedback for successful actions',
    generate: (volume = 0.3) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const playNote = (freq, startTime) => {
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.6, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.15);
      };
      
      playNote(523, now);        // C5
      playNote(659, now + 0.08);  // E5
      playNote(784, now + 0.16);  // G5
    }
  },

  alertError: {
    name: 'Error Buzz',
    category: 'alerts',
    description: 'Negative feedback for errors',
    generate: (volume = 0.3) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = 200;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.08);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.1);
    }
  },

  alertWarning: {
    name: 'Warning Beep',
    category: 'alerts',
    description: 'Caution sound for warnings',
    generate: (volume = 0.3) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const playBeep = (startTime) => {
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.value = 1000;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + 0.06);
        
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.06);
      };
      
      playBeep(now);
      playBeep(now + 0.1);
    }
  },

  // UI sounds
  buttonClick: {
    name: 'Button Click',
    category: 'ui',
    description: 'Subtle click for button presses',
    generate: (volume = 0.2) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 1200;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.03);
    }
  },

  toggleOn: {
    name: 'Toggle On',
    category: 'ui',
    description: 'Rising tone for enabling features',
    generate: (volume = 0.25) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.08);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.08);
    }
  },

  toggleOff: {
    name: 'Toggle Off',
    category: 'ui',
    description: 'Falling tone for disabling features',
    generate: (volume = 0.25) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.08);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.08);
    }
  }
};

// Default sound mappings for different events
const defaultSoundMap = {
  // Session events
  sessionOpen: 'sessionTone',
  sessionClose: 'sessionTone',
  recordStart: 'recordStart',
  recordStop: 'recordStop',
  
  // Chat events
  messageReceived: 'messageReceived',
  messageSent: 'messageSent',
  
  // Alerts
  success: 'alertSuccess',
  error: 'alertError',
  warning: 'alertWarning',
  
  // UI interactions
  buttonClick: 'buttonClick',
  toggleOn: 'toggleOn',
  toggleOff: 'toggleOff'
};

// User preferences (stored in localStorage)
const STORAGE_KEY = 'nurds_audio_preferences';

class AudioManager {
  constructor() {
    this.soundMap = this.loadPreferences();
    this.enabled = true;
    this.volume = 0.3;
  }

  loadPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { ...defaultSoundMap };
    } catch (error) {
      console.error('Error loading audio preferences:', error);
      return { ...defaultSoundMap };
    }
  }

  savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.soundMap));
    } catch (error) {
      console.error('Error saving audio preferences:', error);
    }
  }

  play(eventName, customVolume = null) {
    if (!this.enabled) return;
    
    const soundKey = this.soundMap[eventName];
    if (!soundKey || !AudioLibrary[soundKey]) {
      console.warn(`No sound mapped for event: ${eventName}`);
      return;
    }

    try {
      const volume = customVolume !== null ? customVolume : this.volume;
      AudioLibrary[soundKey].generate(volume);
    } catch (error) {
      console.error(`Error playing sound for ${eventName}:`, error);
    }
  }

  setSound(eventName, soundKey) {
    if (!AudioLibrary[soundKey]) {
      console.error(`Invalid sound key: ${soundKey}`);
      return false;
    }
    
    this.soundMap[eventName] = soundKey;
    this.savePreferences();
    return true;
  }

  resetToDefaults() {
    this.soundMap = { ...defaultSoundMap };
    this.savePreferences();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getAvailableSounds() {
    return Object.entries(AudioLibrary).map(([key, sound]) => ({
      key,
      ...sound
    }));
  }

  getCategories() {
    const sounds = this.getAvailableSounds();
    const categories = [...new Set(sounds.map(s => s.category))];
    return categories.map(cat => ({
      name: cat,
      sounds: sounds.filter(s => s.category === cat)
    }));
  }

  getSoundMap() {
    return { ...this.soundMap };
  }

  previewSound(soundKey, volume = null) {
    if (!AudioLibrary[soundKey]) {
      console.error(`Invalid sound key: ${soundKey}`);
      return;
    }
    
    try {
      const vol = volume !== null ? volume : this.volume;
      AudioLibrary[soundKey].generate(vol);
    } catch (error) {
      console.error(`Error previewing sound ${soundKey}:`, error);
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// Export library for direct access if needed
export { AudioLibrary, defaultSoundMap };
