import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Workbench() {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'acheevy', text: "Hello! I'm ACHEEVY. I'm ready to help you build your Vibe Code project. What shall we work on?" }
  ]);
  const [volumeLevels, setVolumeLevels] = useState([20, 40, 30]);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate voice meter when listening
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setVolumeLevels([
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100
        ]);
      }, 100);
    } else {
      setVolumeLevels([20, 20, 20]);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate listening for 3 seconds then processing
      setTimeout(() => {
        setIsListening(false);
        addMessage('user', "Analyze this function for bottlenecks.");
        setTimeout(() => {
          addMessage('acheevy', "I've analyzed the App component. The render cycle seems efficient, but we could optimize the state updates in the main loop. Shall I refactor that for you?");
        }, 1500);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, { id: Date.now(), role, text }]);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--nqno-banana-bg-primary)', color: 'var(--nqno-banana-text-primary)' }}>
      {/* ACHEEVY Bezel */}
      <aside 
        className={`w-80 border-r flex flex-col transition-all duration-300 acheevy-bezel relative z-20`}
        data-state={isListening ? 'listening' : 'idle'}
        style={{ 
          borderColor: 'var(--nqno-banana-accent)',
          background: isListening ? undefined : 'var(--nqno-banana-bg-secondary)'
        }}
      >
        {/* Bezel Header */}
        <div className="p-6 border-b border-black/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--nqno-banana-font-display)' }}>
              Chat w/ACHEEVY
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs font-medium opacity-70">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
              {isListening ? 'Listening...' : 'Ready'}
            </div>
          </div>
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>
        
        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
          <div className="text-xs text-center opacity-40 uppercase tracking-widest my-4">Session Started</div>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-white text-black rounded-tr-none' 
                    : 'bg-[#1a1a1a] text-white rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] opacity-40 mt-1 px-1">
                {msg.role === 'user' ? 'You' : 'ACHEEVY'}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Voice Controls */}
        <div className="p-6 border-t border-black/5 bg-white/5 backdrop-blur-sm">
          {/* Voice Meter */}
          <div className="flex justify-center items-end gap-1 h-8 mb-4">
            {volumeLevels.map((level, i) => (
              <div 
                key={i} 
                className="w-2 rounded-full voice-meter-bar"
                style={{ 
                  height: `${Math.max(10, level)}%`,
                  backgroundColor: isListening ? '#000' : 'var(--nqno-banana-accent)'
                }}
              />
            ))}
          </div>

          <button 
            onClick={toggleListening}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg ${
              isListening ? 'bg-white text-black' : 'text-black'
            }`}
            style={{ 
              background: isListening ? 'white' : 'var(--nqno-banana-accent)',
            }}
          >
            {isListening ? (
              <>
                <span className="animate-spin text-xl">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                Press & Speak
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white relative z-10">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold font-display">My Smart App</h1>
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-mono">v1.0.2</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
              Settings
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all">
              Deploy App
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 bg-gray-50/50">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* File Explorer */}
            <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col">
              <h3 className="font-bold mb-4 text-gray-400 text-xs uppercase tracking-wider px-2">Project Files</h3>
              <ul className="space-y-1 text-sm flex-1">
                <li className="flex items-center gap-3 p-2 bg-yellow-50 text-yellow-700 rounded-lg font-medium cursor-pointer">
                  <span>📄</span> App.jsx
                </li>
                <li className="flex items-center gap-3 p-2 hover:bg-gray-50 text-gray-600 rounded-lg cursor-pointer transition-colors">
                  <span>📄</span> index.css
                </li>
                <li className="flex items-center gap-3 p-2 hover:bg-gray-50 text-gray-600 rounded-lg cursor-pointer transition-colors">
                  <span>📦</span> package.json
                </li>
              </ul>
            </div>

            {/* Editor Area */}
            <div className="col-span-9 bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-[#3d3d3d]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="ml-4 text-xs text-gray-400 font-mono">src/App.jsx</span>
              </div>
              <div className="flex-1 p-6 font-mono text-sm overflow-auto relative">
                <pre className="text-gray-300 leading-relaxed">
{`import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Hello World
        </h1>
        <p className="text-gray-600">
          Welcome to your new Vibe Code project.
        </p>
      </div>
    </div>
  );
}

export default App;`}
                </pre>
                
                {/* AI Suggestion Overlay */}
                <div className="absolute bottom-6 right-6 max-w-sm bg-[#2d2d2d] border border-yellow-500/30 p-4 rounded-xl shadow-2xl animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <p className="text-xs text-gray-300 mb-2">
                        I noticed you're using inline styles. Would you like me to extract these into a Tailwind component?
                      </p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded bg-yellow-500 text-black text-xs font-bold hover:bg-yellow-400">
                          Apply Fix
                        </button>
                        <button className="px-3 py-1.5 rounded bg-white/10 text-white text-xs hover:bg-white/20">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Workbench;
