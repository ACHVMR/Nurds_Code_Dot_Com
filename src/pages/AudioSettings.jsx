import React, { useState, useEffect } from 'react';
import { audioManager, SOUND_EVENTS, AVAILABLE_SOUNDS } from '../utils/audioManager';
import { Volume2, VolumeX, Play, RotateCcw, Check } from 'lucide-react';

/**
 * Audio Settings Page
 * Allows users to customize notification sounds for different events
 */
export default function AudioSettings() {
  const [soundMap, setSoundMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [activeEvent, setActiveEvent] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    // Load current settings
    setSoundMap(audioManager.getSoundMap());
    setCategories(audioManager.getCategories());
    setVolume(audioManager.volume);
    setEnabled(audioManager.enabled);
  }, []);

  const eventDescriptions = {
    phoneOpen: { label: 'Phone Opens', icon: '📱', description: 'When the Nextel phone interface opens' },
    phoneClose: { label: 'Phone Closes', icon: '📵', description: 'When the Nextel phone interface closes' },
    pttStart: { label: 'PTT Start', icon: '🎙️', description: 'When push-to-talk recording starts' },
    pttEnd: { label: 'PTT End', icon: '🔇', description: 'When push-to-talk recording stops' },
    messageReceived: { label: 'Message Received', icon: '💬', description: 'When a new message arrives' },
    messageSent: { label: 'Message Sent', icon: '✉️', description: 'When you send a message' },
    success: { label: 'Success', icon: '✅', description: 'When an action completes successfully' },
    error: { label: 'Error', icon: '❌', description: 'When an error occurs' },
    warning: { label: 'Warning', icon: '⚠️', description: 'When a warning is displayed' },
    buttonClick: { label: 'Button Click', icon: '🔘', description: 'When buttons are pressed' },
    toggleOn: { label: 'Toggle On', icon: '🟢', description: 'When features are enabled' },
    toggleOff: { label: 'Toggle Off', icon: '🔴', description: 'When features are disabled' }
  };

  const handleSoundChange = (eventName, soundKey) => {
    audioManager.setSound(eventName, soundKey);
    setSoundMap(audioManager.getSoundMap());
    
    // Preview the sound
    audioManager.previewSound(soundKey, volume);
    
    // Show saved indicator
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    audioManager.setVolume(newVolume);
  };

  const handleToggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    audioManager.setEnabled(newEnabled);
    
    if (newEnabled) {
      audioManager.play('toggleOn');
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all sound preferences to defaults?')) {
      audioManager.resetToDefaults();
      setSoundMap(audioManager.getSoundMap());
      audioManager.play('success');
    }
  };

  const handlePreviewSound = (soundKey) => {
    audioManager.previewSound(soundKey, volume);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🔊 Audio Settings</h1>
              <p className="text-gray-400">Customize notification sounds for your experience</p>
            </div>
            
            {justSaved && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-green-500 text-sm font-medium">Saved!</span>
              </div>
            )}
          </div>

          {/* Master Controls */}
          <div className="bg-black/40 border border-[#E68961]/30 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Enable/Disable Sounds */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Sound Effects
                </label>
                <button
                  onClick={handleToggleEnabled}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium transition-all ${
                    enabled
                      ? 'bg-[#E68961] hover:bg-[#D4A05F] text-black'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                  }`}
                >
                  {enabled ? (
                    <>
                      <Volume2 className="w-5 h-5" />
                      <span>Enabled</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-5 h-5" />
                      <span>Disabled</span>
                    </>
                  )}
                </button>
              </div>

              {/* Volume Control */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Master Volume
                </label>
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#E68961] [&::-webkit-slider-thumb]:rounded-full"
                    disabled={!enabled}
                  />
                  <Volume2 className="w-4 h-4 text-[#E68961]" />
                  <span className="text-white font-mono text-sm w-12">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>

              {/* Reset Button */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Reset All
                </label>
                <button
                  onClick={handleResetToDefaults}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sound Mappings */}
        <div className="space-y-6">
          {/* Phone Events */}
          <div className="bg-black/40 border border-[#E68961]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              📱 Phone Events
            </h2>
            <div className="space-y-4">
              {['phone_open', 'phone_close', 'ptt_start', 'ptt_end'].map(eventName => (
                <SoundEventRow
                  key={eventName}
                  eventName={eventName}
                  eventInfo={eventDescriptions[eventName]}
                  currentSound={soundMap[eventName]}
                  categories={categories}
                  onSoundChange={handleSoundChange}
                  onPreview={handlePreviewSound}
                  isActive={activeEvent === eventName}
                  onSetActive={() => setActiveEvent(eventName)}
                  enabled={enabled}
                />
              ))}
            </div>
          </div>

          {/* Chat Events */}
          <div className="bg-black/40 border border-[#E68961]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              💬 Chat Events
            </h2>
            <div className="space-y-4">
              {['message_received', 'message_sent'].map(eventName => (
                <SoundEventRow
                  key={eventName}
                  eventName={eventName}
                  eventInfo={eventDescriptions[eventName]}
                  currentSound={soundMap[eventName]}
                  categories={categories}
                  onSoundChange={handleSoundChange}
                  onPreview={handlePreviewSound}
                  isActive={activeEvent === eventName}
                  onSetActive={() => setActiveEvent(eventName)}
                  enabled={enabled}
                />
              ))}
            </div>
          </div>

          {/* Alert Events */}
          <div className="bg-black/40 border border-[#E68961]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              🚨 Alerts
            </h2>
            <div className="space-y-4">
              {['success', 'error', 'warning'].map(eventName => (
                <SoundEventRow
                  key={eventName}
                  eventName={eventName}
                  eventInfo={eventDescriptions[eventName]}
                  currentSound={soundMap[eventName]}
                  categories={categories}
                  onSoundChange={handleSoundChange}
                  onPreview={handlePreviewSound}
                  isActive={activeEvent === eventName}
                  onSetActive={() => setActiveEvent(eventName)}
                  enabled={enabled}
                />
              ))}
            </div>
          </div>

          {/* UI Events */}
          <div className="bg-black/40 border border-[#E68961]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              🎨 UI Interactions
            </h2>
            <div className="space-y-4">
              {['button_click', 'toggle_on', 'toggle_off'].map(eventName => (
                <SoundEventRow
                  key={eventName}
                  eventName={eventName}
                  eventInfo={eventDescriptions[eventName]}
                  currentSound={soundMap[eventName]}
                  categories={categories}
                  onSoundChange={handleSoundChange}
                  onPreview={handlePreviewSound}
                  isActive={activeEvent === eventName}
                  onSetActive={() => setActiveEvent(eventName)}
                  enabled={enabled}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-[#E68961]/10 border border-[#E68961]/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">ℹ️ About Audio Settings</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            All sounds are generated in real-time using Web Audio API - no audio files needed! 
            Your preferences are saved automatically and will persist across sessions. 
            You can customize each event individually or reset all sounds to their default values.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual sound event row component
 */
function SoundEventRow({ 
  eventName, 
  eventInfo, 
  currentSound, 
  categories, 
  onSoundChange, 
  onPreview,
  isActive,
  onSetActive,
  enabled 
}) {
  return (
    <div 
      className={`bg-gray-900/50 border rounded-lg p-4 transition-all ${
        isActive ? 'border-[#E68961]' : 'border-gray-800'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Event Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{eventInfo.icon}</span>
            <h3 className="text-lg font-semibold text-white">{eventInfo.label}</h3>
          </div>
          <p className="text-sm text-gray-400">{eventInfo.description}</p>
        </div>

        {/* Sound Selector */}
        <div className="flex items-center gap-2">
          <select
            value={currentSound}
            onChange={(e) => onSoundChange(eventName, e.target.value)}
            onClick={onSetActive}
            disabled={!enabled}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#E68961] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {categories.map(category => (
              <optgroup key={category.name} label={category.name.toUpperCase()}>
                {category.sounds.map(sound => (
                  <option key={sound.key} value={sound.key}>
                    {sound.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Preview Button */}
          <button
            onClick={() => onPreview(currentSound)}
            disabled={!enabled}
            className="p-2 bg-[#E68961] hover:bg-[#D4A05F] text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Preview sound"
          >
            <Play className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
