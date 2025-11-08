/**
 * Audio Manager - Centralized sound system for NURDS CODE
 * Generates all sounds using Web Audio API (no external files needed)
 * Supports user customization and event-based sound mapping
 */

// Available sound types
export const AVAILABLE_SOUNDS = {
  // Nextel-style chirps
  nextel_chirp: {
    name: 'Nextel Chirp',
    description: 'Classic dual-tone chirp (850Hz + 1200Hz)',
    type: 'nextel',
    frequencies: [850, 1200],
    duration: 150,
    envelope: { attack: 10, decay: 40, sustain: 70, release: 30 }
  },
  ptt_start: {
    name: 'PTT Start',
    description: 'Push-to-talk start (ascending tone)',
    type: 'nextel',
    frequencies: [800, 1100],
    duration: 100,
    envelope: { attack: 5, decay: 20, sustain: 50, release: 25 }
  },
  ptt_end: {
    name: 'PTT End',
    description: 'Push-to-talk end (descending tone)',
    type: 'nextel',
    frequencies: [1100, 800],
    duration: 100,
    envelope: { attack: 5, decay: 20, sustain: 50, release: 25 }
  },
  
  // Notification sounds
  message_received: {
    name: 'Message Received',
    description: 'Soft notification chime',
    type: 'notification',
    frequencies: [660, 880],
    duration: 200,
    envelope: { attack: 10, decay: 50, sustain: 80, release: 60 }
  },
  message_sent: {
    name: 'Message Sent',
    description: 'Confirmation beep',
    type: 'notification',
    frequencies: [880, 1100],
    duration: 150,
    envelope: { attack: 5, decay: 30, sustain: 70, release: 45 }
  },
  
  // Alert sounds
  success: {
    name: 'Success Chime',
    description: 'Positive feedback (major chord)',
    type: 'alert',
    frequencies: [523, 659, 784],
    duration: 250,
    envelope: { attack: 10, decay: 60, sustain: 100, release: 80 }
  },
  error: {
    name: 'Error Buzz',
    description: 'Error notification (dissonant)',
    type: 'alert',
    frequencies: [200, 180],
    duration: 200,
    envelope: { attack: 5, decay: 50, sustain: 80, release: 65 }
  },
  warning: {
    name: 'Warning Beep',
    description: 'Attention grabber',
    type: 'alert',
    frequencies: [440, 440],
    duration: 300,
    envelope: { attack: 10, decay: 100, sustain: 120, release: 70 }
  },
  
  // UI sounds
  click: {
    name: 'Button Click',
    description: 'Subtle UI feedback',
    type: 'ui',
    frequencies: [800],
    duration: 50,
    envelope: { attack: 2, decay: 15, sustain: 20, release: 13 }
  },
  toggle_on: {
    name: 'Toggle On',
    description: 'Enable sound (rising)',
    type: 'ui',
    frequencies: [600, 900],
    duration: 100,
    envelope: { attack: 5, decay: 25, sustain: 45, release: 25 }
  },
  toggle_off: {
    name: 'Toggle Off',
    description: 'Disable sound (falling)',
    type: 'ui',
    frequencies: [900, 600],
    duration: 100,
    envelope: { attack: 5, decay: 25, sustain: 45, release: 25 }
  }
};

// Sound event types that can be mapped
export const SOUND_EVENTS = {
  PHONE_OPEN: 'phone_open',
  PHONE_CLOSE: 'phone_close',
  PTT_START: 'ptt_start',
  PTT_END: 'ptt_end',
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_SENT: 'message_sent',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  BUTTON_CLICK: 'button_click',
  TOGGLE_ON: 'toggle_on',
  TOGGLE_OFF: 'toggle_off'
};

// Default event-to-sound mappings
const DEFAULT_MAPPINGS = {
  [SOUND_EVENTS.PHONE_OPEN]: 'nextel_chirp',
  [SOUND_EVENTS.PHONE_CLOSE]: 'nextel_chirp',
  [SOUND_EVENTS.PTT_START]: 'ptt_start',
  [SOUND_EVENTS.PTT_END]: 'ptt_end',
  [SOUND_EVENTS.MESSAGE_RECEIVED]: 'message_received',
  [SOUND_EVENTS.MESSAGE_SENT]: 'message_sent',
  [SOUND_EVENTS.SUCCESS]: 'success',
  [SOUND_EVENTS.ERROR]: 'error',
  [SOUND_EVENTS.WARNING]: 'warning',
  [SOUND_EVENTS.BUTTON_CLICK]: 'click',
  [SOUND_EVENTS.TOGGLE_ON]: 'toggle_on',
  [SOUND_EVENTS.TOGGLE_OFF]: 'toggle_off'
};

class AudioManager {
  constructor() {
    this.enabled = true;
    this.masterVolume = 0.3;
    this.soundMappings = { ...DEFAULT_MAPPINGS };
    this.loadSettings();
  }

  /**
   * Load user settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('nurdscode_audio_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.enabled = settings.enabled ?? true;
        this.masterVolume = settings.masterVolume ?? 0.3;
        this.soundMappings = { ...DEFAULT_MAPPINGS, ...settings.soundMappings };
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error);
    }
  }

  /**
   * Save user settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('nurdscode_audio_settings', JSON.stringify({
        enabled: this.enabled,
        masterVolume: this.masterVolume,
        soundMappings: this.soundMappings
      }));
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  }

  /**
   * Enable/disable all sounds
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveSettings();
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * Map an event to a specific sound
   */
  setSoundMapping(event, soundId) {
    if (SOUND_EVENTS[event] && AVAILABLE_SOUNDS[soundId]) {
      this.soundMappings[event] = soundId;
      this.saveSettings();
    }
  }

  /**
   * Reset all mappings to defaults
   */
  resetMappings() {
    this.soundMappings = { ...DEFAULT_MAPPINGS };
    this.saveSettings();
  }

  /**
   * Generate and play a sound using Web Audio API
   */
  playSound(soundId, volumeOverride = null) {
    if (!this.enabled) return;
    
    const sound = AVAILABLE_SOUNDS[soundId];
    if (!sound) {
      console.warn(`Sound not found: ${soundId}`);
      return;
    }

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      const volume = volumeOverride ?? this.masterVolume;
      
      // Create oscillators for each frequency
      const oscillators = sound.frequencies.map(freq => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        return osc;
      });

      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      
      // ADSR Envelope
      const { attack, decay, sustain, release } = sound.envelope;
      const attackTime = attack / 1000;
      const decayTime = decay / 1000;
      const sustainTime = sustain / 1000;
      const releaseTime = release / 1000;
      const totalDuration = sound.duration / 1000;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + attackTime + decayTime);
      gainNode.gain.setValueAtTime(volume * 0.7, now + attackTime + decayTime + sustainTime);
      gainNode.gain.linearRampToValueAtTime(0, now + totalDuration);

      // Connect oscillators to gain node
      oscillators.forEach(osc => {
        osc.connect(gainNode);
      });
      
      // Create stereo effect for multi-frequency sounds
      if (oscillators.length > 1) {
        const merger = audioContext.createChannelMerger(2);
        gainNode.connect(merger, 0, 0);
        gainNode.connect(merger, 0, 1);
        merger.connect(audioContext.destination);
      } else {
        gainNode.connect(audioContext.destination);
      }

      // Start and stop oscillators
      oscillators.forEach(osc => {
        osc.start(now);
        osc.stop(now + totalDuration);
      });

      // Cleanup
      setTimeout(() => {
        oscillators.forEach(osc => osc.disconnect());
        gainNode.disconnect();
        audioContext.close();
      }, totalDuration * 1000 + 100);

    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  /**
   * Play sound for a specific event
   */
  playEvent(eventType, volumeOverride = null) {
    const soundId = this.soundMappings[eventType];
    if (soundId) {
      this.playSound(soundId, volumeOverride);
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      enabled: this.enabled,
      masterVolume: this.masterVolume,
      soundMappings: { ...this.soundMappings }
    };
  }

  /**
   * Get sound map (alias for sound mappings)
   */
  getSoundMap() {
    return { ...this.soundMappings };
  }

  /**
   * Get categories of sounds
   */
  getCategories() {
    const categories = {
      nextel: [],
      notification: [],
      alert: [],
      ui: []
    };

    Object.entries(AVAILABLE_SOUNDS).forEach(([key, sound]) => {
      categories[sound.type].push({
        key,
        name: sound.name,
        description: sound.description
      });
    });

    return [
      { name: 'nextel', sounds: categories.nextel },
      { name: 'notifications', sounds: categories.notification },
      { name: 'alerts', sounds: categories.alert },
      { name: 'ui', sounds: categories.ui }
    ];
  }

  /**
   * Set sound for an event (alias for setSoundMapping)
   */
  setSound(eventName, soundKey) {
    this.setSoundMapping(eventName, soundKey);
  }

  /**
   * Preview a sound
   */
  previewSound(soundKey, volumeOverride = null) {
    this.playSound(soundKey, volumeOverride);
  }

  /**
   * Play sound by event name (alias for playEvent)
   */
  play(eventName) {
    this.playEvent(eventName);
  }

  /**
   * Set volume (alias for setMasterVolume)
   */
  setVolume(volume) {
    this.setMasterVolume(volume);
  }

  /**
   * Reset to defaults (alias for resetMappings)
   */
  resetToDefaults() {
    this.resetMappings();
  }

  /**
   * Get volume property
   */
  get volume() {
    return this.masterVolume;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
