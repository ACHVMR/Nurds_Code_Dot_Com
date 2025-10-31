import React, { useState, useEffect, useRef } from 'react';

const INITIAL_ASSISTANT_MESSAGES = [
  {
    role: 'assistant',
    content: 'Welcome to Vibe Coding! Ask how to shape your prompt, refactor code, or explore the SDK pipeline.',
    model: 'llama3-8b-instant',
  },
];

function Editor() {
  const [code, setCode] = useState('// Nurds Code Editor\n// Think It. Prompt It. Build It.\n\nconsole.log("Hello, World!");');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [assistantMessages, setAssistantMessages] = useState(() => [...INITIAL_ASSISTANT_MESSAGES]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantPlan, setAssistantPlan] = useState('free');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState('');
  const [userId, setUserId] = useState('');
  const messagesEndRef = useRef(null);
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  useEffect(() => {
    try {
      const storedCode = localStorage.getItem('nurdscode_editor_code');
      const storedLanguage = localStorage.getItem('nurdscode_editor_language');
      const storedPlan = localStorage.getItem('nurdscode_assistant_plan');
      const storedMessages = localStorage.getItem('nurdscode_assistant_history');
      const storedUserId = localStorage.getItem('nurdscode_user_id');

      if (storedCode) {
        setCode(storedCode);
      }
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
      if (storedPlan) {
        setAssistantPlan(storedPlan);
      }
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        if (Array.isArray(parsed) && parsed.length) {
          setAssistantMessages(parsed);
        }
      }
      if (storedUserId) {
        setUserId(storedUserId);
      } else if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        const newId = `user-${crypto.randomUUID()}`;
        localStorage.setItem('nurdscode_user_id', newId);
        setUserId(newId);
      } else {
        const fallbackId = `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem('nurdscode_user_id', fallbackId);
        setUserId(fallbackId);
      }
    } catch (error) {
      console.warn('Unable to restore editor state:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('nurdscode_editor_code', code);
    } catch (error) {
      console.warn('Unable to persist code snippet:', error);
    }
  }, [code]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('nurdscode_editor_language', language);
    } catch (error) {
      console.warn('Unable to persist language selection:', error);
    }
  }, [language]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('nurdscode_assistant_plan', assistantPlan);
    } catch (error) {
      console.warn('Unable to persist assistant plan:', error);
    }
  }, [assistantPlan]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('nurdscode_assistant_history', JSON.stringify(assistantMessages));
    } catch (error) {
      console.warn('Unable to persist assistant history:', error);
    }
  }, [assistantMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantMessages, assistantLoading]);

  const runCode = () => {
    try {
      // Simple JavaScript execution for demo
      if (language === 'javascript') {
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.join(' ')),
        };
        
        // Create a function with custom console
        const func = new Function('console', code);
        func(customConsole);
        
        setOutput(logs.join('\n') || 'Code executed successfully!');
      } else {
        setOutput('This is a demo editor. Full execution support coming soon!');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const sendAssistantMessage = async (event) => {
    event.preventDefault();
    const trimmed = assistantInput.trim();
    if (!trimmed || assistantLoading) {
      return;
    }

    const historyPayload = [...assistantMessages, { role: 'user', content: trimmed }]
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));

    setAssistantMessages((prev) => {
      const next = [...prev, { role: 'user', content: trimmed }];
      return next.slice(-20);
    });
    setAssistantInput('');
    setAssistantError('');
    setAssistantLoading(true);

    try {
      const response = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          plan: assistantPlan,
          userId,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Assistant request failed.');
      }

      const data = await response.json();
      setAssistantMessages((prev) => {
        const next = [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            model: data.model,
            usage: data.usage,
          },
        ];
        return next.slice(-20);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Assistant request failed.';
      setAssistantError(message);
      setAssistantMessages((prev) => {
        const next = [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${message}`,
            error: true,
          },
        ];
        return next.slice(-20);
      });
    } finally {
      setAssistantLoading(false);
    }
  };

  const resetAssistant = () => {
    setAssistantMessages([...INITIAL_ASSISTANT_MESSAGES]);
    setAssistantError('');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 text-text">Editor</h1>
          <p className="tagline text-2xl">Think It. Prompt It. Build It.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text">Editor</h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 bg-background text-text font-mono text-sm p-4 border border-border focus:outline-none focus:border-accent resize-none"
              spellCheck="false"
            />
            
            <button
              onClick={runCode}
              className="btn-primary w-full mt-4"
            >
              Run Code
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Output Panel */}
            <div className="panel">
              <h2 className="text-xl font-semibold mb-4 text-text">Output</h2>
              <div className="bg-background text-text font-mono text-sm p-4 border border-border h-48 md:h-64 overflow-auto">
                {output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-mute">Output will appear here...</div>
                )}
              </div>
            </div>

            {/* Assistant Panel */}
            <div className="panel">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-text">Vibe Coding Assistant</h2>
                  <p className="text-sm text-mute">
                    Cloudflare VibeSDK hints tailored to your plan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={assistantPlan}
                    onChange={(event) => setAssistantPlan(event.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="free">Free · GROQ 8B</option>
                    <option value="coffee">Coffee · GROQ 70B</option>
                    <option value="pro">Pro · GPT-4o mini</option>
                    <option value="enterprise">Enterprise · Claude mix</option>
                  </select>
                  <button
                    type="button"
                    onClick={resetAssistant}
                    className="text-xs text-accent hover:text-neon"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="bg-background border border-border h-64 overflow-y-auto px-4 py-3">
                {assistantMessages.map((msg, index) => (
                  <div key={`assistant-message-${index}`} className="mb-4">
                    <div className="text-xs uppercase tracking-wide text-mute mb-1">
                      {msg.role === 'assistant' ? 'Assistant' : 'You'}
                    </div>
                    <div className={`whitespace-pre-wrap text-sm ${msg.error ? 'text-accent' : 'text-text'}`}>
                      {msg.content}
                    </div>
                    {msg.model && (
                      <div className="text-[10px] uppercase text-mute mt-1">
                        Model: {msg.model}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {assistantError && (
                <div className="text-xs text-accent mt-3">
                  {assistantError}
                </div>
              )}

              <form onSubmit={sendAssistantMessage} className="mt-4 space-y-3">
                <textarea
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  className="w-full bg-background border border-border text-sm text-text p-3 focus:outline-none focus:border-accent min-h-[96px] resize-none"
                  placeholder="Ask about scaffolding, SDK usage, or how to improve your prompt..."
                  disabled={assistantLoading}
                />
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="btn-primary px-6"
                    disabled={assistantLoading || !assistantInput.trim()}
                  >
                    {assistantLoading ? 'Thinking...' : 'Ask Vibe Assistant'}
                  </button>
                  <span className="text-xs text-mute">
                    {assistantLoading
                      ? 'Generating guidance via Cloudflare AI Gateway'
                      : 'Responses tuned for your selected tier'}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="panel text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Instant Execution</h3>
            <p className="text-mute text-sm">
              Run your code instantly and see results in real-time
            </p>
          </div>
          <div className="panel text-center">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Auto-Save</h3>
            <p className="text-mute text-sm">
              Your code is automatically saved as you type
            </p>
          </div>
          <div className="panel text-center">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Multi-Language</h3>
            <p className="text-mute text-sm">
              Support for JavaScript, Python, TypeScript, and more
            </p>
          </div>
        </div>

        {/* Pro Features CTA */}
        <div className="panel mt-8 border-2 border-accent">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-text">Unlock Pro Features</h3>
            <p className="text-text mb-6">
              Get access to advanced debugging, code sharing, team collaboration, and more
            </p>
            <button className="btn-primary">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;
