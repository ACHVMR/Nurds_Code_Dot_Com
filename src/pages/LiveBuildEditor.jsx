import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './LiveBuildEditor.css';

const AGENTS = [
  { name: 'ResearchAng', icon: '🔍', task: 'Researching best patterns' },
  { name: 'DataAng', icon: '💾', task: 'Designing database schema' },
  { name: 'CodeAng', icon: '⚙️', task: 'Scaffolding project structure' },
  { name: 'SecurityAng', icon: '🔒', task: 'Setting up authentication' },
  { name: 'IntegrationAng', icon: '🔗', task: 'Configuring integrations' },
  { name: 'UIAng', icon: '🎨', task: 'Building user interface' },
  { name: 'TestAng', icon: '🧪', task: 'Writing test suites' },
  { name: 'OptimizeAng', icon: '⚡', task: 'Optimizing performance' },
  { name: 'DocAng', icon: '📚', task: 'Generating documentation' },
  { name: 'AccessibilityAng', icon: '♿', task: 'Ensuring accessibility' },
  { name: 'I18nAng', icon: '🌍', task: 'Adding internationalization' },
  { name: 'CacheAng', icon: '📦', task: 'Setting up caching' },
  { name: 'MonitorAng', icon: '📊', task: 'Adding monitoring' },
  { name: 'BackupAng', icon: '💿', task: 'Configuring backups' },
  { name: 'CDNAng', icon: '🌐', task: 'Setting up CDN' },
  { name: 'CIAng', icon: '🔄', task: 'Configuring CI/CD' },
  { name: 'DeployAng', icon: '🚀', task: 'Deploying to production' }
];

const LiveBuildEditor = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const { prd } = location.state || {};
  
  const [agents, setAgents] = useState(
    AGENTS.map(agent => ({ ...agent, status: 'pending', progress: 0 }))
  );
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [logs, setLogs] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [deployed, setDeployed] = useState(false);
  const [deployUrl, setDeployUrl] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [changeRequest, setChangeRequest] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    startBuild();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [projectId]);

  const startBuild = () => {
    const token = window.Clerk?.session?.getToken();
    eventSourceRef.current = new EventSource(
      `/api/build-live/${projectId}?token=${token}`
    );

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.agent) {
        updateAgentStatus(data.agent, data.status, data.progress);
        addLog(data);
      }
      
      if (data.status === 'deployed') {
        setDeployed(true);
        setDeployUrl(data.url);
        eventSourceRef.current.close();
      }
      
      if (data.progress) {
        setOverallProgress(data.progress);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSourceRef.current.close();
    };
  };

  const updateAgentStatus = (agentName, status, progress) => {
    setAgents(prev => prev.map(agent => 
      agent.name === agentName 
        ? { ...agent, status, progress }
        : agent
    ));
    
    if (status === 'in_progress') {
      const index = AGENTS.findIndex(a => a.name === agentName);
      setCurrentAgentIndex(index);
    }
  };

  const addLog = (data) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      agent: data.agent,
      message: data.log,
      status: data.status
    }]);
  };

  const handleInterrupt = async () => {
    if (!changeRequest.trim()) return;
    
    setIsPaused(true);
    
    try {
      const token = await window.Clerk?.session?.getToken();
      const response = await fetch(`/api/build-impact/${projectId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ change: changeRequest })
      });

      const impact = await response.json();
      
      const confirmed = window.confirm(
        `⚠️ Impact Analysis:\n\n${impact.message}\n\nEstimated delay: ${impact.estimated_time}\n\nProceed with this change?`
      );
      
      if (confirmed) {
        // Apply changes and restart affected agents
        await applyChanges();
      }
    } catch (error) {
      console.error('Failed to analyze impact:', error);
    } finally {
      setIsPaused(false);
      setChangeRequest('');
    }
  };

  const applyChanges = async () => {
    // Implementation for applying changes
    console.log('Applying changes...');
  };

  return (
    <div className="live-build-editor">
      <header className="build-header">
        <h1>🔨 Building: {prd?.title || 'Your App'}</h1>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="progress-text">{overallProgress}%</span>
        </div>
      </header>

      <div className="build-layout">
        {/* Left: Agent Timeline */}
        <div className="agents-panel">
          <h3>17 Agents Working</h3>
          <div className="agents-timeline">
            {agents.map((agent, idx) => (
              <div 
                key={agent.name}
                className={`agent-item ${agent.status}`}
                data-active={idx === currentAgentIndex}
              >
                <div className="agent-icon">{agent.icon}</div>
                <div className="agent-info">
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-task">{agent.task}</div>
                  {agent.status === 'in_progress' && (
                    <div className="agent-progress">
                      <div 
                        className="agent-progress-bar"
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="agent-status">
                  {agent.status === 'completed' && '✅'}
                  {agent.status === 'in_progress' && '⚡'}
                  {agent.status === 'pending' && '⏳'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Build Logs */}
        <div className="logs-panel">
          <h3>Build Logs</h3>
          <div className="logs-container">
            {logs.map((log, idx) => (
              <div key={idx} className={`log-entry ${log.status}`}>
                <span className="log-time">{log.timestamp}</span>
                <span className="log-agent">[{log.agent}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="controls-panel">
          {!deployed ? (
            <>
              <h3>Make Changes</h3>
              <p className="info-text">
                You can request changes anytime. ACHEEVY will analyze the impact.
              </p>
              
              <textarea
                value={changeRequest}
                onChange={(e) => setChangeRequest(e.target.value)}
                placeholder="e.g., 'Add dark mode toggle' or 'Use Tailwind instead of Bootstrap'"
                className="change-input"
                disabled={isPaused}
              />
              
              <button 
                className="interrupt-btn"
                onClick={handleInterrupt}
                disabled={isPaused || !changeRequest.trim()}
              >
                {isPaused ? '⏳ Analyzing...' : '🔄 Request Change'}
              </button>
              
              <div className="current-status">
                <h4>Current Agent</h4>
                <div className="current-agent">
                  <span className="agent-icon">
                    {agents[currentAgentIndex]?.icon}
                  </span>
                  <span className="agent-name">
                    {agents[currentAgentIndex]?.name}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="deployed-section">
              <h2>🎉 Build Complete!</h2>
              <p>Your app is live!</p>
              
              <div className="deploy-url">
                <code>{deployUrl}</code>
                <button 
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(deployUrl)}
                >
                  📋
                </button>
              </div>
              
              <div className="deploy-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => window.open(deployUrl, '_blank')}
                >
                  👁️ View App
                </button>
                <button className="action-btn">
                  💾 Export Code
                </button>
                <button className="action-btn">
                  🔗 Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveBuildEditor;
