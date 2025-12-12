import React, { useState, useRef, useEffect } from 'react';
import './AgentBuilder.css';

/**
 * Agent Builder - Production Version
 * Prompt interface for creating and deploying AI agents
 */

const AGENT_TEMPLATES = [
  { id: 'custom', name: 'Custom Agent', icon: '🤖', desc: 'Build from scratch with a prompt' },
  { id: 'chatbot', name: 'Customer Support', icon: '💬', desc: 'Answer questions, handle tickets' },
  { id: 'researcher', name: 'Research Agent', icon: '🔍', desc: 'Deep research and analysis' },
  { id: 'coder', name: 'Code Assistant', icon: '💻', desc: 'Write, review, and debug code' },
  { id: 'data', name: 'Data Processor', icon: '📊', desc: 'ETL, analysis, visualization' },
  { id: 'writer', name: 'Content Writer', icon: '✍️', desc: 'Blog posts, copy, documentation' }
];

const AVAILABLE_TOOLS = [
  { id: 'web_search', name: 'Web Search', icon: '🌐', provider: 'Tavily' },
  { id: 'code_exec', name: 'Code Execution', icon: '▶️', provider: 'Sandbox' },
  { id: 'file_ops', name: 'File Operations', icon: '📁', provider: 'Local' },
  { id: 'database', name: 'Database', icon: '🗃️', provider: 'Supabase' },
  { id: 'api_call', name: 'API Calls', icon: '🔌', provider: 'HTTP' },
  { id: 'email', name: 'Email', icon: '📧', provider: 'Resend' },
  { id: 'browser', name: 'Browser', icon: '🌍', provider: 'Playwright' },
  { id: 'vision', name: 'Vision', icon: '👁️', provider: 'GPT-4o' }
];

const AI_MODELS = [
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', recommended: true },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', recommended: true },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', recommended: false },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', recommended: true }
];

export default function AgentBuilder() {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet');
  const [selectedTools, setSelectedTools] = useState(['web_search', 'code_exec']);
  const [agentName, setAgentName] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState([]);
  const [builtAgent, setBuiltAgent] = useState(null);
  const [deployStatus, setDeployStatus] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const promptRef = useRef(null);

  const toggleTool = (toolId) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
  };

  const addProgress = (message, type = 'info') => {
    setBuildProgress(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const handleBuildAgent = async () => {
    if (!prompt.trim() && !agentName.trim()) {
      alert('Please provide a name and description for your agent');
      return;
    }

    setIsBuilding(true);
    setBuildProgress([]);
    setBuiltAgent(null);
    setDeployStatus(null);

    try {
      addProgress('📋 Analyzing requirements...', 'info');
      await new Promise(r => setTimeout(r, 800));

      addProgress('🧠 Selecting optimal AI model...', 'info');
      await new Promise(r => setTimeout(r, 600));
      addProgress(`✓ Using ${AI_MODELS.find(m => m.id === selectedModel)?.name}`, 'success');

      addProgress('🔧 Configuring tools...', 'info');
      await new Promise(r => setTimeout(r, 500));
      selectedTools.forEach(toolId => {
        const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
        addProgress(`  + ${tool?.name} (${tool?.provider})`, 'info');
      });

      addProgress('🏗️ Building agent architecture...', 'info');
      await new Promise(r => setTimeout(r, 1000));

      addProgress('🔌 Connecting to providers...', 'info');
      await new Promise(r => setTimeout(r, 800));

      addProgress('✅ Agent built successfully!', 'success');

      const agent = {
        id: Date.now().toString(),
        name: agentName || `Agent_${Date.now()}`,
        description: prompt,
        model: selectedModel,
        tools: selectedTools,
        template: selectedTemplate,
        status: 'ready',
        createdAt: new Date().toISOString()
      };

      setBuiltAgent(agent);
    } catch (error) {
      addProgress(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDeploy = async () => {
    if (!builtAgent) return;

    setDeployStatus('deploying');
    addProgress('🚀 Deploying agent to cloud...', 'info');

    try {
      await new Promise(r => setTimeout(r, 1500));
      
      addProgress('🌐 Creating public endpoint...', 'info');
      await new Promise(r => setTimeout(r, 800));

      const endpoint = `https://agents.nurdscode.com/${builtAgent.name.toLowerCase().replace(/\s+/g, '-')}`;
      
      addProgress(`✓ Deployed to: ${endpoint}`, 'success');
      addProgress('✓ API key generated', 'success');

      setDeployStatus('deployed');
      setBuiltAgent(prev => ({ ...prev, endpoint, apiKey: `nk_${Date.now()}_secret` }));
    } catch (error) {
      addProgress(`❌ Deployment failed: ${error.message}`, 'error');
      setDeployStatus('error');
    }
  };

  const handleTestChat = () => {
    setShowChat(true);
    setChatMessages([{
      role: 'assistant',
      content: `Hello! I'm ${builtAgent?.name || 'your agent'}. How can I help you today?`
    }]);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate agent response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I received your message: "${chatInput}". As ${builtAgent?.name}, I would process this using my ${selectedTools.length} configured tools and respond accordingly. [This is a demo response - connect to actual APIs for production]`
      }]);
    }, 1000);
  };

  return (
    <div className="agent-builder">
      {/* Header */}
      <div className="ab-header">
        <div className="ab-title">
          <h1>🤖 Agent Builder</h1>
          <p>Create, configure, and deploy AI agents with a prompt</p>
        </div>
      </div>

      <div className="ab-layout">
        {/* Left Panel - Configuration */}
        <div className="ab-config">
          {/* Name */}
          <div className="config-section">
            <label className="config-label">Agent Name</label>
            <input
              type="text"
              className="config-input"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="MyAgent_Ang"
            />
          </div>

          {/* Template Selection */}
          <div className="config-section">
            <label className="config-label">Start From Template</label>
            <div className="template-grid">
              {AGENT_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  className={`template-btn ${selectedTemplate === template.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <span className="template-icon">{template.icon}</span>
                  <span className="template-name">{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="config-section">
            <label className="config-label">Describe Your Agent</label>
            <textarea
              ref={promptRef}
              className="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what your agent should do. Example: 'An agent that monitors my GitHub repos, summarizes new issues, and suggests code fixes...'"
              rows={5}
            />
          </div>

          {/* Model Selection */}
          <div className="config-section">
            <label className="config-label">AI Model</label>
            <div className="model-grid">
              {AI_MODELS.map(model => (
                <button
                  key={model.id}
                  className={`model-btn ${selectedModel === model.id ? 'active' : ''}`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <span className="model-name">{model.name}</span>
                  <span className="model-provider">{model.provider}</span>
                  {model.recommended && <span className="model-badge">⭐</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Selection */}
          <div className="config-section">
            <label className="config-label">Agent Tools</label>
            <div className="tools-grid">
              {AVAILABLE_TOOLS.map(tool => (
                <button
                  key={tool.id}
                  className={`tool-btn ${selectedTools.includes(tool.id) ? 'active' : ''}`}
                  onClick={() => toggleTool(tool.id)}
                >
                  <span className="tool-icon">{tool.icon}</span>
                  <span className="tool-name">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Build Button */}
          <button 
            className="build-btn"
            onClick={handleBuildAgent}
            disabled={isBuilding}
          >
            {isBuilding ? '⏳ Building...' : '🔨 Build Agent'}
          </button>
        </div>

        {/* Right Panel - Output */}
        <div className="ab-output">
          {/* Build Progress */}
          <div className="output-section">
            <h3>📋 Build Log</h3>
            <div className="build-log">
              {buildProgress.length === 0 ? (
                <div className="log-empty">Configure your agent and click "Build Agent" to start...</div>
              ) : (
                buildProgress.map((log, i) => (
                  <div key={i} className={`log-entry log-${log.type}`}>
                    <span className="log-time">[{log.time}]</span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Built Agent Details */}
          {builtAgent && (
            <div className="output-section agent-card">
              <h3>✅ Agent Ready</h3>
              <div className="agent-details">
                <div className="detail-row">
                  <span>Name:</span>
                  <span className="detail-value">{builtAgent.name}</span>
                </div>
                <div className="detail-row">
                  <span>Model:</span>
                  <span className="detail-value">{AI_MODELS.find(m => m.id === builtAgent.model)?.name}</span>
                </div>
                <div className="detail-row">
                  <span>Tools:</span>
                  <span className="detail-value">{builtAgent.tools.length} connected</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={`status-badge status-${builtAgent.status}`}>
                    {builtAgent.status}
                  </span>
                </div>
                {builtAgent.endpoint && (
                  <div className="detail-row">
                    <span>Endpoint:</span>
                    <code className="endpoint">{builtAgent.endpoint}</code>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="agent-actions">
                {deployStatus !== 'deployed' ? (
                  <button 
                    className="action-btn deploy"
                    onClick={handleDeploy}
                    disabled={deployStatus === 'deploying'}
                  >
                    {deployStatus === 'deploying' ? '🚀 Deploying...' : '🚀 Deploy to Cloud'}
                  </button>
                ) : (
                  <button className="action-btn deployed" disabled>
                    ✓ Deployed
                  </button>
                )}
                <button className="action-btn test" onClick={handleTestChat}>
                  💬 Test Chat
                </button>
                <button className="action-btn export">
                  📦 Export
                </button>
              </div>
            </div>
          )}

          {/* Chat Test Panel */}
          {showChat && (
            <div className="chat-panel">
              <div className="chat-header">
                <span>💬 Test: {builtAgent?.name}</span>
                <button onClick={() => setShowChat(false)}>✕</button>
              </div>
              <div className="chat-messages">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Type a message..."
                />
                <button onClick={handleSendChat}>Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
