import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import scribe2 from '../utils/scribe2';
import { useRole } from '../context/RoleContext';

const SmartSidePanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();
  const { role, toggleRole, isOwner } = useRole();

  const primaryColor = isOwner ? '#00D4FF' : '#00FF88';

  const handleSend = () => {
    if (!prompt.trim()) return;
    
    // Redirect to Editor with prompt state
    navigate('/editor', { 
      state: { 
        initialPrompt: prompt,
        autoRun: true 
      } 
    });
    setPrompt('');
    setIsOpen(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      const audioBlob = await scribe2.stopRecording();
      const text = await scribe2.transcribe(audioBlob);
      if (text) {
        setPrompt(prev => prev + ' ' + text);
      }
      setIsProcessing(false);
    } else {
      const started = await scribe2.startRecording();
      if (started) {
        setIsRecording(true);
      }
    }
  };

  return (
    <>
      {/* Toggle Button (Always Visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 p-2 rounded-l-xl transition-all hover:pr-4"
        style={{
          background: 'rgba(10, 10, 10, 0.9)',
          border: `1px solid ${primaryColor}40`,
          borderRight: 'none',
          boxShadow: `-5px 0 20px -5px ${primaryColor}30`
        }}
      >
        <div className="writing-mode-vertical text-xs font-bold tracking-widest" style={{ color: primaryColor }}>
          {isOpen ? 'CLOSE' : 'ACHEEVY'}
        </div>
      </button>

      {/* Panel Content */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-96 z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          borderLeft: `1px solid ${primaryColor}40`,
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#fff' }}>Smart Assistant</h2>
              <div className="text-xs opacity-60" style={{ color: primaryColor }}>POWERED BY V.I.B.E.</div>
            </div>
          </div>

          {/* Quick Platform Toggle */}
          <div className="mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="text-xs mb-2 text-gray-400">CURRENT PLATFORM CONTEXT</div>
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: primaryColor }}>
                {isOwner ? '⚡ INFRASTRUCTURE' : '🎨 VIBE CODING'}
              </span>
              <button
                onClick={toggleRole}
                className="px-3 py-1 rounded text-xs border transition-all"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor 
                }}
              >
                SWITCH
              </button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-grow flex flex-col justify-end gap-3">
             <div className="text-sm text-gray-400 mb-2">
               Ask ACHEEVY to build or explain anything...
             </div>
             
             <textarea
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="E.g., build a reacting landing page..."
               className="w-full h-32 bg-black/50 border rounded-xl p-3 text-sm focus:outline-none resize-none"
               style={{ borderColor: `${primaryColor}40`, color: '#fff' }}
             />

             <div className="flex gap-2">
               <button
                 onClick={toggleRecording}
                 className="p-3 rounded-xl transition-all flex-1 flex items-center justify-center gap-2"
                 style={{ 
                   background: isRecording ? `${primaryColor}20` : 'rgba(255,255,255,0.05)',
                   color: primaryColor,
                   border: `1px solid ${isRecording ? primaryColor : 'transparent'}`
                 }}
               >
                 {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : '🎤 Voice'}
               </button>
               
               <button
                 onClick={handleSend}
                 className="p-3 rounded-xl font-bold flex-[2] transition-opacity hover:opacity-90"
                 style={{ 
                   background: primaryColor,
                   color: '#000'
                 }}
               >
                 🚀 Launch Editor
               </button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SmartSidePanel;
