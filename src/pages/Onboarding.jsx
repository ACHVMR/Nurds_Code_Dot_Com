/**
 * ONBOARDING FLOW - Nothing Brand Inspired
 * Design: 3-step wizard with progress indicator
 * Step 1: Choose path (Builder vs Creator)
 * Step 2: Select template
 * Step 3: Confirm & launch
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import '../styles/onboarding.css';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with full control',
    icon: '▢',
  },
  {
    id: 'chat',
    name: 'Chat App',
    description: 'Real-time messaging platform',
    icon: '💬',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Full store setup with payment',
    icon: '🛒',
  },
  {
    id: 'saas',
    name: 'SaaS Starter',
    description: 'Multi-tenant ready app',
    icon: '⚙',
  },
];

const PATHS = [
  {
    id: 'builder',
    name: 'I want to build apps',
    description: 'Compose with code, deploy anywhere',
    icon: '◆',
  },
  {
    id: 'creator',
    name: 'I want to create content',
    description: 'Use AI agents to craft your work',
    icon: '◇',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [path, setPath] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [projectName, setProjectName] = useState('My Project');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNextStep = () => {
    if (currentStep === 1 && !path) {
      setError('Please select a path to continue');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleLaunch = async () => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!user) throw new Error('User not authenticated');

      // Create project in Supabase
      const { data, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name: projectName,
            template: selectedTemplate,
            path: path,
            description: `${projectName} - Created via onboarding`,
            status: 'active',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // Redirect to editor
      navigate(`/studio/editor/${data.id}`);
    } catch (err) {
      console.error('Launch error:', err);
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      {/* Header with progress */}
      <div className="onboarding-header">
        <h1 className="onboarding-title">Let's get started</h1>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          {[1, 2, 3].map((step) => (
            <div key={step} className="progress-group">
              <div
                className={`step ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < 3 && (
                <div className={`step-line ${step < currentStep ? 'active' : ''}`} />
              )}
            </div>
          ))}
        </div>

        <p className="progress-text">
          Step {currentStep} of 3
        </p>
      </div>

      {/* Content Area */}
      <div className="onboarding-content">
        {/* Step 1: Choose Path */}
        {currentStep === 1 && (
          <div className="step-content">
            <h2>What's your role?</h2>
            <p className="step-subtitle">
              Choose how you want to use Nurds Code
            </p>

            <div className="paths-grid">
              {PATHS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPath(p.id)}
                  className={`path-card ${path === p.id ? 'selected' : ''}`}
                >
                  <div className="path-icon">{p.icon}</div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                </button>
              ))}
            </div>

            {error && <p className="error-message">{error}</p>}
          </div>
        )}

        {/* Step 2: Select Template */}
        {currentStep === 2 && (
          <div className="step-content">
            <h2>Choose a template</h2>
            <p className="step-subtitle">
              Pick a starting point or begin with a blank canvas
            </p>

            <div className="templates-grid">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                >
                  <div className="template-icon">{template.icon}</div>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 3 && (
          <div className="step-content">
            <h2>Almost there!</h2>
            <p className="step-subtitle">
              Give your project a name
            </p>

            <div className="form-group">
              <label htmlFor="projectName">Project name</label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setError('');
                }}
                placeholder="My awesome project"
                className="form-input"
                autoFocus
              />
            </div>

            <div className="summary">
              <div className="summary-item">
                <span className="label">Role:</span>
                <span className="value">
                  {path === 'builder' ? 'Builder' : 'Creator'}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Template:</span>
                <span className="value">
                  {TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
                </span>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="onboarding-footer">
        <button
          onClick={handlePreviousStep}
          className="nav-button secondary"
          disabled={currentStep === 1}
        >
          Back
        </button>

        <button
          onClick={currentStep === 3 ? handleLaunch : handleNextStep}
          className="nav-button primary"
          disabled={isLoading || (currentStep === 1 && !path)}
        >
          {isLoading ? 'Creating...' : currentStep === 3 ? 'Launch Project' : 'Next'}
        </button>
      </div>
    </div>
  );
}
