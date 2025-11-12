import React, { useState } from 'react';
import { ACPErrorBoundary } from './ACPErrorBoundary';
import './IntentModals.css';

/**
 * Safe fetch wrapper with timeout and error handling
 */
async function safeFetch(url, options = {}, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server took too long to respond');
    }
    
    throw error;
  }
}

/**
 * RE-IMAGINE Modal - Competitor Analysis Flow
 */
export function ReimagineModal({ isOpen, onClose, onSubmit }) {
  const [userIdea, setUserIdea] = useState('');
  const [competitors, setCompetitors] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddCompetitor = () => {
    if (competitors.length >= 10) {
      setError('Maximum 10 competitors allowed');
      return;
    }
    setCompetitors([...competitors, '']);
    setError(null);
  };

  const handleCompetitorChange = (index, value) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validCompetitors = competitors.filter(c => c.trim() !== '');
      
      if (!userIdea.trim()) {
        throw new Error('Please describe what you want to build');
      }
      
      if (validCompetitors.length === 0) {
        throw new Error('Please add at least one competitor URL');
      }

      const result = await onSubmit({ userIdea, competitors: validCompetitors });
      
      // Reset form on success
      setUserIdea('');
      setCompetitors(['', '']);
      setError(null);
      onClose();
      
      return result;
    } catch (err) {
      console.error('[RE-IMAGINE] Submit failed:', err);
      setError(err.message || 'Failed to analyze competitors. Please try again.');
      
      // Log to Charter
      console.log('[Charter] RE-IMAGINE error:', {
        timestamp: Date.now(),
        error: err.toString(),
        userIdea: userIdea.substring(0, 50)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="intent-modal-overlay" onClick={handleClose}>
      <div className="intent-modal" onClick={(e) => e.stopPropagation()}>
        <div className="intent-modal-header">
          <h2>🔮 RE-IMAGINE</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="intent-modal-body">
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
              <button type="button" onClick={() => setError(null)} className="error-dismiss">×</button>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="userIdea">What do you want to build?</label>
            <textarea
              id="userIdea"
              value={userIdea}
              onChange={(e) => setUserIdea(e.target.value)}
              placeholder="e.g., A marketplace like Airbnb for vintage cars"
              rows={3}
              required
              disabled={loading}
              maxLength={500}
            />
            <small>{userIdea.length}/500 characters</small>
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
                disabled={loading}
              />
            ))}
            <button
              type="button"
              onClick={handleAddCompetitor}
              className="btn-secondary"
              disabled={loading || competitors.length >= 10}
            >
              + Add Competitor {competitors.length >= 10 && '(Max reached)'}
            </button>
          </div>

          <div className="intent-modal-footer">
            <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Analyzing...' : '🚀 Generate Superior Version'}
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
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!repoUrl.trim()) {
      setError('Repository URL is required.');
      return false;
    }
    try {
      new URL(repoUrl);
    } catch (_) {
      setError('Please enter a valid URL.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await onSubmit({ repoUrl, platform: platform === 'auto' ? null : platform });
      setRepoUrl('');
      setPlatform('auto');
      onClose();
    } catch (err) {
      console.error('[IMPORT] Submit failed:', err);
      setError(err.message || 'Failed to import repository. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="intent-modal-overlay" onClick={handleClose}>
      <div className="intent-modal" onClick={(e) => e.stopPropagation()}>
        <ACPErrorBoundary>
          <div className="intent-modal-header">
            <h2>📥 IMPORT</h2>
            <button className="modal-close" onClick={handleClose} disabled={loading}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="intent-modal-body">
            {error && (
              <div className="error-banner">
                <span>⚠️ {error}</span>
                <button type="button" onClick={() => setError(null)} className="error-dismiss">×</button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="repoUrl">Repository URL</label>
              <input
                id="repoUrl"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo or https://huggingface.co/user/model"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="platform">Platform (Auto-detect or select)</label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                disabled={loading}
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
              <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Cloning...' : 'Import Repository'}
              </button>
            </div>
          </form>
        </ACPErrorBoundary>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setError(null);
  };

  const validateForm = () => {
    if (!apiSpec.trim() && !repoUrl.trim()) {
      setError('Either an API Spec or a Repository URL is required.');
      return false;
    }
    if (selectedScenarios.filter(s => s.selected).length === 0) {
      setError('At least one test scenario must be selected.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

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
    } catch (err) {
      console.error('[LAB] Submit failed:', err);
      setError(err.message || 'Failed to run tests. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="intent-modal-overlay" onClick={handleClose}>
      <div className="intent-modal" onClick={(e) => e.stopPropagation()}>
        <ACPErrorBoundary>
          <div className="intent-modal-header">
            <h2>🧪 TESTING LAB</h2>
            <button className="modal-close" onClick={handleClose} disabled={loading}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="intent-modal-body">
            {error && (
              <div className="error-banner">
                <span>⚠️ {error}</span>
                <button type="button" onClick={() => setError(null)} className="error-dismiss">×</button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="apiSpec">API Spec (optional)</label>
              <input
                id="apiSpec"
                type="text"
                value={apiSpec}
                onChange={(e) => setApiSpec(e.target.value)}
                placeholder="OpenAPI/Swagger URL or API endpoint"
                disabled={loading}
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
                disabled={loading}
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
                      disabled={loading}
                    />
                    <span>{scenario.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="intent-modal-footer">
              <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Running Tests...' : 'Run Playwright Tests'}
              </button>
            </div>
          </form>
        </ACPErrorBoundary>
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
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!userPrefix.trim()) {
      setError('Your name/prefix is required.');
      return false;
    }
    if (!agentRole.trim()) {
      setError('The agent role/capability is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await onSubmit({ userPrefix, agentRole, framework });
      setUserPrefix('');
      setAgentRole('');
      setFramework('CrewAI');
      onClose();
    } catch (err) {
      console.error('[AGENTS] Submit failed:', err);
      setError(err.message || 'Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="intent-modal-overlay" onClick={handleClose}>
      <div className="intent-modal" onClick={(e) => e.stopPropagation()}>
        <ACPErrorBoundary>
          <div className="intent-modal-header">
            <h2>🤖 CREATE AGENT</h2>
            <button className="modal-close" onClick={handleClose} disabled={loading}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="intent-modal-body">
            {error && (
              <div className="error-banner">
                <span>⚠️ {error}</span>
                <button type="button" onClick={() => setError(null)} className="error-dismiss">×</button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="userPrefix">Your Name/Prefix</label>
              <input
                id="userPrefix"
                type="text"
                value={userPrefix}
                onChange={(e) => setUserPrefix(e.target.value)}
                placeholder="e.g., John, Sarah, Alex"
                required
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="framework">AI Framework</label>
              <select
                id="framework"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                disabled={loading}
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
              <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Deploying...' : 'Create & Deploy Agent'}
              </button>
            </div>
          </form>
        </ACPErrorBoundary>
      </div>
    </div>
  );
}
