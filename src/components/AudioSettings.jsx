import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Music, Bell, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { audioManager, SOUND_EVENTS, AVAILABLE_SOUNDS } from '../utils/audioManager';
import '../styles/audioSettings.css';

export default function AudioSettings() {
  const [settings, setSettings] = useState(audioManager.getSettings());
  const [playingSound, setPlayingSound] = useState(null);

  // Update local state when settings change
  useEffect(() => {
    setSettings(audioManager.getSettings());
  }, []);

  const handleToggleSounds = () => {
    const newEnabled = !settings.enabled;
    audioManager.setEnabled(newEnabled);
    setSettings(audioManager.getSettings());
    
    // Play toggle sound
    if (newEnabled) {
      audioManager.playSound('toggle_on');
    }
  };

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    audioManager.setMasterVolume(volume);
    setSettings(audioManager.getSettings());
  };

  const handlePlaySound = (soundId) => {
    setPlayingSound(soundId);
    audioManager.playSound(soundId);
    setTimeout(() => setPlayingSound(null), 500);
  };

  const handleMappingChange = (event, soundId) => {
    audioManager.setSoundMapping(event, soundId);
    setSettings(audioManager.getSettings());
    audioManager.playSound(soundId, 0.2);
  };

  const handleSave = () => {
    audioManager.saveSettings();
    audioManager.playEvent(SOUND_EVENTS.SUCCESS);
    alert('Audio settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Reset all sound mappings to defaults?')) {
      audioManager.resetMappings();
      setSettings(audioManager.getSettings());
      audioManager.playEvent(SOUND_EVENTS.WARNING);
    }
  };

  const handleTestAll = () => {
    const soundIds = Object.keys(AVAILABLE_SOUNDS);
    let delay = 0;
    
    soundIds.forEach((soundId) => {
      setTimeout(() => {
        handlePlaySound(soundId);
      }, delay);
      delay += 300;
    });
  };

  const getEventIcon = (event) => {
    const icons = {
      phone_open: '📱',
      phone_close: '📱',
      ptt_start: '🎙️',
      ptt_end: '🎙️',
      message_received: '📩',
      message_sent: '📤',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      button_click: '🖱️',
      toggle_on: '🔊',
      toggle_off: '🔇'
    };
    return icons[event] || '🔔';
  };

  const getEventLabel = (event) => {
    return event.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="audio-settings">
      <div className="audio-settings-container">
        {/* Header */}
        <div className="audio-settings-header">
          <h1 className="audio-settings-title">
            <Music className="inline-block mr-3" size={32} />
            Audio Settings
          </h1>
          <p className="audio-settings-subtitle">
            Customize your notification sounds and audio experience
          </p>
        </div>

        {/* Master Controls */}
        <div className="master-controls">
          <div className="master-controls-grid">
            <div className="control-group">
              <label className="control-label">
                {settings.enabled ? (
                  <Volume2 className="control-icon" size={18} />
                ) : (
                  <VolumeX className="control-icon" size={18} />
                )}
                Sound Effects
              </label>
              <button
                onClick={handleToggleSounds}
                className={`toggle-button ${settings.enabled ? 'enabled' : 'disabled'}`}
              >
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="control-group">
              <label className="control-label">
                <Volume2 className="control-icon" size={18} />
                Master Volume
              </label>
              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  disabled={!settings.enabled}
                />
                <span className="volume-value">
                  {Math.round(settings.masterVolume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sound Library */}
        <div className="sound-library">
          <h2 className="section-title">
            <Music size={24} />
            Available Sounds
          </h2>
          <div className="sounds-grid">
            {Object.entries(AVAILABLE_SOUNDS).map(([soundId, sound]) => (
              <div
                key={soundId}
                className={`sound-card ${playingSound === soundId ? 'playing' : ''}`}
              >
                <div className="sound-card-header">
                  <span className="sound-name">{sound.name}</span>
                  <button
                    onClick={() => handlePlaySound(soundId)}
                    className={`play-button ${playingSound === soundId ? 'playing' : ''}`}
                    disabled={!settings.enabled}
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>
                <p className="sound-description">{sound.description}</p>
                <div className="sound-params">
                  <span className="param-badge">{sound.duration}ms</span>
                  <span className="param-badge">
                    {sound.frequencies.join('Hz + ')}Hz
                  </span>
                  <span className="param-badge">{sound.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Mappings */}
        <div className="event-mappings">
          <h2 className="section-title">
            <Bell size={24} />
            Event Sound Mappings
          </h2>
          <div className="mappings-grid">
            {Object.values(SOUND_EVENTS).map((event) => (
              <div key={event} className="mapping-card">
                <div className="mapping-header">
                  <div className="mapping-icon">
                    <span style={{ fontSize: '1.5rem' }}>{getEventIcon(event)}</span>
                  </div>
                  <h3 className="mapping-title">{getEventLabel(event)}</h3>
                </div>
                <select
                  value={settings.soundMappings[event] || ''}
                  onChange={(e) => handleMappingChange(event, e.target.value)}
                  className="mapping-dropdown"
                  disabled={!settings.enabled}
                >
                  {Object.entries(AVAILABLE_SOUNDS).map(([soundId, sound]) => (
                    <option key={soundId} value={soundId}>
                      {sound.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleSave} className="action-btn save-btn">
            <CheckCircle size={20} className="inline mr-2" />
            Save Settings
          </button>
          <button onClick={handleReset} className="action-btn reset-btn">
            <AlertCircle size={20} className="inline mr-2" />
            Reset to Defaults
          </button>
          <button onClick={handleTestAll} className="action-btn test-btn" disabled={!settings.enabled}>
            <Zap size={20} className="inline mr-2" />
            Test All Sounds
          </button>
        </div>
      </div>
    </div>
  );
}
