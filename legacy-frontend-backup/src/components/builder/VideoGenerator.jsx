import React, { useState } from 'react';
import './VideoGenerator.css';
import { UGC_TEMPLATES, estimateVideoCost, generateVideo } from '../../services/video-generation';
import MODEL_GARDEN from '../../config/model-garden';

/**
 * VideoGenerator - UGC-style video generation interface
 */
export default function VideoGenerator({ onVideoGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('runway');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const videoModels = MODEL_GARDEN.videoGeneration;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress({ status: 'starting', progress: 0, message: 'Initializing...' });

    try {
      const result = await generateVideo({
        prompt,
        provider: selectedProvider,
        duration,
        aspectRatio,
        template: selectedTemplate,
        onProgress: (p) => setProgress(p)
      });

      setProgress({ status: 'completed', progress: 100, message: 'Video ready!' });
      
      if (onVideoGenerated) {
        onVideoGenerated(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const estimate = estimateVideoCost(selectedProvider, duration);

  return (
    <div className="video-generator">
      {/* Header */}
      <div className="vg-header">
        <h2>🎬 UGC Video Generator</h2>
        <p>Create professional user-generated content style videos</p>
      </div>

      {/* Template Selection */}
      <div className="vg-section">
        <label className="section-label">1. Choose a Template (Optional)</label>
        <div className="template-grid">
          {Object.entries(UGC_TEMPLATES).map(([id, template]) => (
            <div
              key={id}
              className={`template-card ${selectedTemplate === id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(selectedTemplate === id ? null : id)}
            >
              <h4>{template.name}</h4>
              <p>{template.description}</p>
              <div className="template-meta">
                <span>{template.duration}s</span>
                <span>{template.aspectRatio}</span>
                <span>{template.style}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="vg-section">
        <label className="section-label">2. Describe Your Video</label>
        <textarea
          className="prompt-input"
          placeholder="A person unboxing a new smartphone, showing excitement as they discover each feature..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
        />
        {selectedTemplate && UGC_TEMPLATES[selectedTemplate] && (
          <div className="prompt-prefix">
            <span className="prefix-label">Template prefix:</span>
            <span className="prefix-text">
              {UGC_TEMPLATES[selectedTemplate].suggestedPromptPrefix}
            </span>
          </div>
        )}
      </div>

      {/* Provider Selection */}
      <div className="vg-section">
        <label className="section-label">3. Select Video Model</label>
        <div className="provider-grid">
          {Object.entries(videoModels).map(([id, model]) => (
            <div
              key={id}
              className={`provider-card ${selectedProvider === id ? 'selected' : ''}`}
              onClick={() => setSelectedProvider(id)}
            >
              <div className="provider-name">{model.name}</div>
              <div className="provider-meta">
                <span>${model.costPerSecond}/sec</span>
                <span>Max {model.maxDuration}s</span>
                <span>{model.tier}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="vg-section settings-row">
        <div className="setting-item">
          <label>Duration</label>
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            {[3, 5, 10, 15, 30, 60].map(d => (
              <option key={d} value={d}>{d} seconds</option>
            ))}
          </select>
        </div>
        <div className="setting-item">
          <label>Aspect Ratio</label>
          <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait/TikTok)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="4:5">4:5 (Instagram)</option>
          </select>
        </div>
      </div>

      {/* Cost Estimate */}
      <div className="vg-estimate">
        <div className="estimate-item">
          <span className="estimate-label">💰 Estimated Cost</span>
          <span className="estimate-value">${estimate.baseCost.toFixed(2)}</span>
        </div>
        <div className="estimate-item">
          <span className="estimate-label">🎯 Credits</span>
          <span className="estimate-value">{estimate.creditCost} credits</span>
        </div>
        <div className="estimate-item">
          <span className="estimate-label">⏱️ Processing Time</span>
          <span className="estimate-value">{estimate.estimatedTime}</span>
        </div>
      </div>

      {/* Progress */}
      {progress && isGenerating && (
        <div className="vg-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <span className="progress-message">{progress.message}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="vg-error">
          ⚠️ {error}
        </div>
      )}

      {/* Generate Button */}
      <button 
        className="generate-btn"
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
      >
        {isGenerating ? (
          <>
            <span className="spinner"></span>
            Generating...
          </>
        ) : (
          <>🎬 Generate Video</>
        )}
      </button>
    </div>
  );
}
