import React, { useState } from 'react';
import './IntentModals.css';

/**
 * RE-IMAGINE Modal - Competitor Analysis Flow
 */
export function ReimagineModal({ isOpen, onClose, onSubmit }) {
  const [userIdea, setUserIdea] = useState('');
  const [competitors, setCompetitors] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  const handleAddCompetitor = () => {
    setCompetitors([...competitors, '']);
  };

  const handleCompetitorChange = (index, value) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validCompetitors = competitors.filter(c => c.trim() !== '');
      await onSubmit({ userIdea, competitors: validCompetitors });
      // Reset form
      setUserIdea('');
      setCompetitors(['', '']);
      onClose();
    } catch (error) {
      console.error('[RE-IMAGINE] Submit failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="intent-modal-overlay" onClick={onClose}>
      <div className="intent-modal" onClick={(e) => e.stopPropagation()}>
        <div className="intent-modal-header">
          <h2>🔮 RE-IMAGINE</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="intent-modal-body">
          <div className="form-group">
            <label htmlFor="userIdea">What do you want to build?</label>
            <textarea
              id="userIdea"
              value={userIdea}
              onChange={(e) => setUserIdea(e.target.value)}
              placeholder="e.g., A marketplace like Airbnb for vintage cars"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Competitor URLs (for analysis)</label>
            {competitors.map((competitor, index) => (
              <input
                key={index}
                type="url"
                value={competitor}
                onChange={(e) => handleCompetitorChange(index, e.target.value)}
                placeholder={`https://competitor${index + 1}.com`}
                className="competitor-input"
              />
            ))}
            <button
              type="button"
              onClick={handleAddCompetitor}
              className="btn-secondary"
            >
              + Add Competitor
            </button>
          </div>

          <div className="intent-modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Analyzing...' : 'Generate Superior Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * IMPORT Modal - Repository Import Flow
 */
export function ImportModal({ isOpen, onClose, onSubmit }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [platform, setPlatform] = useState('auto');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({ repoUrl, platform: platform === 'auto' ? null : platform });
      setRepoUrl('');
      setPlatform('auto');
      onClose();
    } catch (error) {
      console.error('[IMPORT] Submit failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="intent-modal-overlay" onClick={onClose}>
      <div className="intent-modal" onClick={(e) => e.stopPropagation()}>
        <div className="intent-modal-header">
          <h2>📥 IMPORT</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="intent-modal-body">
          <div className="form-group">
            <label htmlFor="repoUrl">Repository URL</label>
            <input
              id="repoUrl"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo or https://huggingface.co/user/model"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="platform">Platform (Auto-detect or select)</label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="auto">Auto-detect</option>
              <option value="github">GitHub</option>
              <option value="gitlab">GitLab</option>
              <option value="bitbucket">Bitbucket</option>
              <option value="huggingface">Hugging Face</option>
            </select>
          </div>

          <div className="import-info">
            <p>✨ Supports: GitHub, GitLab, Bitbucket, Hugging Face</p>
            <p>📁 Files will open in Monaco editor</p>
          </div>

          <div className="intent-modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Cloning...' : 'Import Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * LAB Modal - Testing Scenarios Flow
 */
export function LabModal({ isOpen, onClose, onSubmit }) {
  const [apiSpec, setApiSpec] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const defaultScenarios = [
    { id: 'auth-flow', label: 'Authentication Flow', selected: true },
    { id: 'create-project', label: 'Create Project', selected: true },
    { id: 'export-plug', label: 'Export Plug', selected: true },
    { id: 'error-handling', label: 'Error Handling', selected: true },
    { id: 'responsive-layout', label: 'Responsive Layout', selected: true },
  ];

  const [selectedScenarios, setSelectedScenarios] = useState(defaultScenarios);

  const handleToggleScenario = (id) => {
    setSelectedScenarios(prev =>
      prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const activeScenarios = selectedScenarios
        .filter(s => s.selected)
        .map(s => s.id);

      await onSubmit({
        apiSpec: apiSpec || null,
        repoUrl: repoUrl || null,
        scenarios: activeScenarios
      });

      onClose();
    } catch (error) {
      console.error('[LAB] Submit failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="intent-modal-overlay" onClick={onClose}>
      <div className="intent-modal" onClick={(e) => e.stopPropagation()}>
        <div className="intent-modal-header">
          <h2>🧪 TESTING LAB</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="intent-modal-body">
          <div className="form-group">
            <label htmlFor="apiSpec">API Spec (optional)</label>
            <input
              id="apiSpec"
              type="text"
              value={apiSpec}
              onChange={(e) => setApiSpec(e.target.value)}
              placeholder="OpenAPI/Swagger URL or API endpoint"
            />
          </div>

          <div className="form-group">
            <label htmlFor="repoUrl">Repository URL (optional)</label>
            <input
              id="repoUrl"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
            />
          </div>

          <div className="form-group">
            <label>Test Scenarios (Playwright)</label>
            <div className="scenario-list">
              {selectedScenarios.map(scenario => (
                <label key={scenario.id} className="scenario-checkbox">
                  <input
                    type="checkbox"
                    checked={scenario.selected}
                    onChange={() => handleToggleScenario(scenario.id)}
                  />
                  <span>{scenario.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="intent-modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Running Tests...' : 'Run Playwright Tests'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * AGENTS Modal - Boomer_Ang Creation Flow
 */
export function AgentsModal({ isOpen, onClose, onSubmit }) {
  const [userPrefix, setUserPrefix] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [framework, setFramework] = useState('CrewAI');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({ userPrefix, agentRole, framework });
      setUserPrefix('');
      setAgentRole('');
      setFramework('CrewAI');
      onClose();
    } catch (error) {
      console.error('[AGENTS] Submit failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="intent-modal-overlay" onClick={onClose}>
      <div className="intent-modal" onClick={(e) => e.stopPropagation()}>
        <div className="intent-modal-header">
          <h2>🤖 CREATE AGENT</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="intent-modal-body">
          <div className="form-group">
            <label htmlFor="userPrefix">Your Name/Prefix</label>
            <input
              id="userPrefix"
              type="text"
              value={userPrefix}
              onChange={(e) => setUserPrefix(e.target.value)}
              placeholder="e.g., John, Sarah, Alex"
              required
            />
            <small>Agent will be named: {userPrefix}Ang (Boomer_Ang convention)</small>
          </div>

          <div className="form-group">
            <label htmlFor="agentRole">Agent Role/Capability</label>
            <input
              id="agentRole"
              type="text"
              value={agentRole}
              onChange={(e) => setAgentRole(e.target.value)}
              placeholder="e.g., code-review, documentation, testing"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="framework">AI Framework</label>
            <select
              id="framework"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
            >
              <option value="CrewAI">CrewAI</option>
              <option value="OpenAI">OpenAI Assistants</option>
              <option value="Microsoft">Microsoft Semantic Kernel</option>
              <option value="LangChain">LangChain</option>
            </select>
          </div>

          <div className="agent-preview">
            <h4>Preview:</h4>
            <p><strong>Name:</strong> {userPrefix}Ang</p>
            <p><strong>Role:</strong> {agentRole || 'N/A'}</p>
            <p><strong>Framework:</strong> {framework}</p>
            <p><strong>Tier:</strong> tier-6-orchestration (Circuit Box)</p>
          </div>

          <div className="intent-modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Deploying...' : 'Create & Deploy Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
