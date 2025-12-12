import React, { useState } from 'react';
import './Build.css';
import AppBuilder from '../components/builder/AppBuilder';
import VideoGenerator from '../components/builder/VideoGenerator';
import ModelSelector from '../components/builder/ModelSelector';

/**
 * Build Page - The main creation hub
 * "Think It. Prompt It. Build It."
 */
export default function Build() {
  const [activeTab, setActiveTab] = useState('app');
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [generatedProject, setGeneratedProject] = useState(null);

  return (
    <div className="build-page">
      {/* Hero Section */}
      <div className="build-hero">
        <h1>
          <span className="hero-think">Think It.</span>
          <span className="hero-prompt">Prompt It.</span>
          <span className="hero-build">Build It.</span>
        </h1>
        <p>Create full-stack apps, UGC videos, and more with AI-powered tools</p>
      </div>

      {/* Tab Navigation */}
      <div className="build-tabs">
        <button 
          className={`tab ${activeTab === 'app' ? 'active' : ''}`}
          onClick={() => setActiveTab('app')}
        >
          <span className="tab-icon">🚀</span>
          <span className="tab-label">App Builder</span>
          <span className="tab-desc">Full-stack apps in minutes</span>
        </button>
        <button 
          className={`tab ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          <span className="tab-icon">🎬</span>
          <span className="tab-label">Video Generator</span>
          <span className="tab-desc">UGC-style video content</span>
        </button>
        <button 
          className={`tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          <span className="tab-icon">🧠</span>
          <span className="tab-label">Model Garden</span>
          <span className="tab-desc">Explore AI models</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="build-content">
        {activeTab === 'app' && (
          <AppBuilder 
            onProjectGenerated={(project) => {
              setGeneratedProject(project);
              console.log('Project generated:', project);
            }}
          />
        )}

        {activeTab === 'video' && (
          <VideoGenerator 
            onVideoGenerated={(video) => {
              setGeneratedVideo(video);
              console.log('Video generated:', video);
            }}
          />
        )}

        {activeTab === 'models' && (
          <div className="models-explorer">
            <div className="explorer-header">
              <h2>🧠 Model Garden</h2>
              <p>
                Access 30+ AI models from leading providers. Open-source and closed-source, 
                optimized for different tasks and budgets.
              </p>
            </div>
            <ModelSelector 
              selectedModel={null}
              onSelectModel={(model) => console.log('Selected:', model)}
              showPricing={true}
            />
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="build-stats">
        <div className="stat-item">
          <span className="stat-value">30+</span>
          <span className="stat-label">AI Models</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">6</span>
          <span className="stat-label">Video Providers</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">5</span>
          <span className="stat-label">Frameworks</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">∞</span>
          <span className="stat-label">Possibilities</span>
        </div>
      </div>
    </div>
  );
}
