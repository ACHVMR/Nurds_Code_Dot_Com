import React, { useState, useEffect } from 'react';
import { Mic, Upload, Play, Pause, Trash2, Check } from 'lucide-react';
import VoicePlayback from '../components/VoicePlayback';

function VoiceProfileSettings() {
  const [voiceProfiles, setVoiceProfiles] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('default-natural');
  const [uploading, setUploading] = useState(false);
  const [testPlaying, setTestPlaying] = useState(null);
  const [speed, setSpeed] = useState(1.0);
  const [personality, setPersonality] = useState('professional');

  useEffect(() => {
    fetchVoiceProfiles();
  }, []);

  const fetchVoiceProfiles = async () => {
    try {
      const response = await fetch('/api/voice/profiles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch voice profiles');
      }

      const data = await response.json();
      setVoiceProfiles(data.profiles || []);
    } catch (err) {
      console.error('Error fetching voice profiles:', err);
    }
  };

  const handleVoiceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file (MP3 or WAV)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('voice', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload voice');
      }

      const data = await response.json();
      alert(`Voice uploaded successfully! Voice ID: ${data.voiceId}`);
      fetchVoiceProfiles();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const testVoice = async (voiceId) => {
    try {
      setTestPlaying(voiceId);
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          text: "Hello! This is a test of your voice profile. How do I sound?",
          voiceId: voiceId,
          speed: speed,
          personality: personality,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate test audio');
      }

      const data = await response.json();
      // Play audio
      const audio = new Audio(data.audioUrl);
      audio.play();
      audio.onended = () => setTestPlaying(null);
    } catch (err) {
      alert(`Test failed: ${err.message}`);
      setTestPlaying(null);
    }
  };

  const deleteVoice = async (voiceId) => {
    if (!confirm('Are you sure you want to delete this voice profile?')) {
      return;
    }

    try {
      const response = await fetch(`/api/voice/profiles/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete voice');
      }

      alert('Voice profile deleted');
      fetchVoiceProfiles();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const defaultVoices = [
    { id: 'default-natural', name: 'Natural', description: 'Warm and conversational' },
    { id: 'default-energetic', name: 'Energetic', description: 'Upbeat and enthusiastic' },
    { id: 'default-calm', name: 'Calm', description: 'Soothing and professional' },
    { id: 'default-authoritative', name: 'Authoritative', description: 'Confident and commanding' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mic className="w-8 h-8 text-[#E68961]" />
            <h1 className="text-4xl font-bold">Voice Profile Settings</h1>
          </div>
          <p className="text-gray-400">
            Customize your voice preferences for AI-generated speech
          </p>
        </div>

        {/* Voice Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Speed Control */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Speed</h3>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full mb-2"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>0.5x</span>
              <span className="text-[#E68961] font-semibold">{speed}x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Personality */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Personality</h3>
            <select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#E68961]"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="technical">Technical</option>
              <option value="creative">Creative</option>
            </select>
          </div>

          {/* Upload Custom Voice */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Custom Voice</h3>
            <label className="block">
              <input
                type="file"
                accept="audio/*"
                onChange={handleVoiceUpload}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#E68961] text-black rounded-lg font-semibold cursor-pointer hover:bg-[#D4A05F] transition-colors">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Voice</span>
                  </>
                )}
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-2">MP3 or WAV, max 10MB</p>
          </div>
        </div>

        {/* Default Voices */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Default Voices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultVoices.map((voice) => (
              <div
                key={voice.id}
                className={`bg-[#1a1a1a] border rounded-lg p-6 cursor-pointer transition-all ${
                  selectedVoice === voice.id
                    ? 'border-[#E68961] bg-[#E68961]/5'
                    : 'border-[#2a2a2a] hover:border-[#E68961]/50'
                }`}
                onClick={() => setSelectedVoice(voice.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-1">{voice.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{voice.description}</p>
                  </div>
                  {selectedVoice === voice.id && (
                    <Check className="w-6 h-6 text-[#E68961] flex-shrink-0" />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    testVoice(voice.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#E68961] hover:text-black rounded-lg text-sm font-semibold transition-colors"
                  disabled={testPlaying === voice.id}
                >
                  {testPlaying === voice.id ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Playing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Test Voice</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Voices */}
        {voiceProfiles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Custom Voices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voiceProfiles.map((voice) => (
                <div
                  key={voice.voice_id}
                  className={`bg-[#1a1a1a] border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedVoice === voice.voice_id
                      ? 'border-[#E68961] bg-[#E68961]/5'
                      : 'border-[#2a2a2a] hover:border-[#E68961]/50'
                  }`}
                  onClick={() => setSelectedVoice(voice.voice_id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-1">{voice.name || 'Custom Voice'}</h3>
                      <p className="text-sm text-gray-400">
                        Uploaded {new Date(voice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedVoice === voice.voice_id && (
                      <Check className="w-6 h-6 text-[#E68961] flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        testVoice(voice.voice_id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#E68961] hover:text-black rounded-lg text-sm font-semibold transition-colors"
                      disabled={testPlaying === voice.voice_id}
                    >
                      {testPlaying === voice.voice_id ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Playing</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Test</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVoice(voice.voice_id);
                      }}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceProfileSettings;
