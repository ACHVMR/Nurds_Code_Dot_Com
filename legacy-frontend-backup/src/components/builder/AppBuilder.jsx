import React, { useState } from 'react';
import './AppBuilder.css';
import ModelSelector from './ModelSelector';
import BuildProgress from './BuildProgress';
import { PROJECT_TEMPLATES, estimateProjectCost } from '../../config/project-builder';

/**
 * AppBuilder - Full-stack application generation interface
 * Think It. Prompt It. Build It.
 */
export default function AppBuilder({ onProjectGenerated }) {
  const [step, setStep] = useState(1); // 1: Describe, 2: Configure, 3: Build
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet');
  const [buildConfig, setBuildConfig] = useState({
    framework: 'react',
    styling: 'tailwind',
    database: 'supabase',
    deployment: 'cloudflare',
    features: []
  });
  const [estimate, setEstimate] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildPhase, setBuildPhase] = useState(null);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState([]);

  // Calculate estimate when description changes
  const handleDescriptionChange = (value) => {
    setProjectDescription(value);
    if (value.length > 20) {
      const est = estimateProjectCost(value, selectedModel);
      setEstimate(est);
    } else {
      setEstimate(null);
    }
  };

  const handleStartBuild = async () => {
    setIsBuilding(true);
    setStep(3);
    setBuildLogs([]);

    const phases = [
      { id: 'analysis', duration: 2000 },
      { id: 'architecture', duration: 3000 },
      { id: 'scaffolding', duration: 2000 },
      { id: 'components', duration: 8000 },
      { id: 'styling', duration: 4000 },
      { id: 'integration', duration: 4000 },
      { id: 'testing', duration: 3000 },
      { id: 'deployment', duration: 2000 }
    ];

    const addLog = (message, type = 'info') => {
      const time = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      setBuildLogs(prev => [...prev, { time, message, type }]);
    };

    for (const phase of phases) {
      setBuildPhase(phase.id);
      setBuildProgress(0);
      addLog(`Starting ${phase.id}...`, 'info');

      // Simulate progress within phase
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        await new Promise(r => setTimeout(r, phase.duration / steps));
        setBuildProgress((i / steps) * 100);
      }

      addLog(`Completed ${phase.id}`, 'success');
    }

    setIsBuilding(false);
    addLog('🎉 Project build complete!', 'success');

    if (onProjectGenerated) {
      onProjectGenerated({
        description: projectDescription,
        template: selectedTemplate,
        model: selectedModel,
        config: buildConfig,
        estimate
      });
    }
  };

  return (
    <div className="app-builder">
      {/* Progress Stepper */}
      <div className="builder-stepper">
        <div className={`stepper-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'complete' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Think It</span>
        </div>
        <div className="stepper-line"></div>
        <div className={`stepper-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'complete' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Prompt It</span>
        </div>
        <div className="stepper-line"></div>
        <div className={`stepper-item ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Build It</span>
        </div>
      </div>

      {/* Step 1: Describe */}
      {step === 1 && (
        <div className="builder-step">
          <div className="step-header">
            <h2>💡 Think It</h2>
            <p>Describe the app you want to build</p>
          </div>

          {/* Template Selection */}
          <div className="template-section">
            <label>Start from a template or describe your custom project</label>
            <div className="template-grid">
              {Object.entries(PROJECT_TEMPLATES).map(([id, template]) => (
                <div
                  key={id}
                  className={`template-card ${selectedTemplate === id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(id)}
                >
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  <div className="template-meta">
                    <span>⏱️ {template.estimatedTime}</span>
                    <span>📊 Complexity {template.complexity}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div className="description-section">
            <label>Describe your project in detail</label>
            <textarea
              className="description-input"
              placeholder="I want to build a task management app with user authentication, real-time collaboration, dark mode, and the ability to assign tasks to team members..."
              value={projectDescription}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={6}
            />
          </div>

          {/* Live Estimate */}
          {estimate && (
            <BuildProgress 
              isBuilding={false}
              estimate={estimate}
            />
          )}

          <div className="step-actions">
            <button 
              className="next-btn"
              onClick={() => setStep(2)}
              disabled={projectDescription.length < 20}
            >
              Continue to Configuration →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="builder-step">
          <div className="step-header">
            <h2>⚙️ Prompt It</h2>
            <p>Configure your build settings</p>
          </div>

          {/* Model Selection */}
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            capability="code"
            compact
          />

          {/* Tech Stack */}
          <div className="config-section">
            <h3>Tech Stack</h3>
            <div className="config-grid">
              <div className="config-item">
                <label>Framework</label>
                <select 
                  value={buildConfig.framework}
                  onChange={(e) => setBuildConfig({...buildConfig, framework: e.target.value})}
                >
                  <option value="react">React + Vite</option>
                  <option value="nextjs">Next.js</option>
                  <option value="vue">Vue 3</option>
                  <option value="svelte">SvelteKit</option>
                  <option value="vanilla">Vanilla JS</option>
                </select>
              </div>
              <div className="config-item">
                <label>Styling</label>
                <select 
                  value={buildConfig.styling}
                  onChange={(e) => setBuildConfig({...buildConfig, styling: e.target.value})}
                >
                  <option value="tailwind">Tailwind CSS</option>
                  <option value="css">Vanilla CSS</option>
                  <option value="styled">Styled Components</option>
                  <option value="sass">SASS/SCSS</option>
                </select>
              </div>
              <div className="config-item">
                <label>Database</label>
                <select 
                  value={buildConfig.database}
                  onChange={(e) => setBuildConfig({...buildConfig, database: e.target.value})}
                >
                  <option value="supabase">Supabase</option>
                  <option value="firebase">Firebase</option>
                  <option value="d1">Cloudflare D1</option>
                  <option value="prisma">Prisma + PostgreSQL</option>
                  <option value="none">No Database</option>
                </select>
              </div>
              <div className="config-item">
                <label>Deployment</label>
                <select 
                  value={buildConfig.deployment}
                  onChange={(e) => setBuildConfig({...buildConfig, deployment: e.target.value})}
                >
                  <option value="cloudflare">Cloudflare Pages</option>
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                  <option value="manual">Manual/Docker</option>
                </select>
              </div>
            </div>
          </div>

          {/* Updated Estimate */}
          {estimate && (
            <div className="final-estimate">
              <h3>📊 Final Estimate</h3>
              <div className="estimate-summary">
                <div className="estimate-item">
                  <span className="label">Total Cost</span>
                  <span className="value">${estimate.totalCost.toFixed(2)}</span>
                </div>
                <div className="estimate-item">
                  <span className="label">Build Time</span>
                  <span className="value">{estimate.estimatedTimeFormatted}</span>
                </div>
                <div className="estimate-item">
                  <span className="label">Model</span>
                  <span className="value">{selectedModel}</span>
                </div>
              </div>
            </div>
          )}

          <div className="step-actions">
            <button className="back-btn" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button className="build-btn" onClick={handleStartBuild}>
              🚀 Start Building
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Build */}
      {step === 3 && (
        <div className="builder-step">
          <div className="step-header">
            <h2>🔨 Build It</h2>
            <p>Watching your app come to life</p>
          </div>

          <BuildProgress
            isBuilding={isBuilding}
            currentPhase={buildPhase}
            progress={buildProgress}
            logs={buildLogs}
            estimate={estimate}
            onCancel={() => {
              setIsBuilding(false);
              setStep(2);
            }}
          />

          {!isBuilding && buildLogs.length > 0 && (
            <div className="build-complete">
              <h3>🎉 Your App is Ready!</h3>
              <div className="complete-actions">
                <button className="preview-btn">👁️ Preview</button>
                <button className="download-btn">📦 Download</button>
                <button className="deploy-btn">🚀 Deploy Now</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
