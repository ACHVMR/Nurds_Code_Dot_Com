import React from 'react';
import { useNextelPhone } from '../hooks/useNextelPhone';
import VoiceRecorder from './VoiceRecorder';
import VoicePlayback from './VoicePlayback';

/**
 * NextelPhone Component (Large Desktop Version)
 * Flip phone UI with chat window inside
 * Features chirp sounds and Nothing Brand design
 */
export default function NextelPhone({ messages = [], onSendMessage }) {
  const { isOpen, soundsEnabled, togglePhone, playMessageChirp, toggleSounds } = useNextelPhone();
  const [inputText, setInputText] = React.useState('');
  const [showVoiceInput, setShowVoiceInput] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
      playMessageChirp('message');
    }
  };

  const handleVoiceTranscript = ({ text }) => {
    setInputText(text);
    setShowVoiceInput(false);
  };

  return (
    <div className="nextel-phone-container fixed bottom-8 right-8 z-40 pointer-events-none">
      {/* Phone Body - Fixed Height Container to Prevent Jumping */}
      <div className={`relative transition-all duration-700 ease-in-out pointer-events-auto`} style={{ height: isOpen ? '640px' : '180px', width: '320px' }}>
        {/* Flip Phone Design */}
        <div className="relative w-full h-full">
          {/* Top Half (Flip Cover) - Animated Flip */}
          <div
            className={`absolute inset-x-0 top-0 bg-linear-to-b from-black to-gray-900 border-2 border-[#E68961] rounded-t-3xl transition-all duration-700 ease-in-out shadow-[0_0_20px_rgba(230,137,97,0.3)] cursor-pointer hover:shadow-[0_0_30px_rgba(230,137,97,0.5)]`}
            style={{
              height: isOpen ? '0px' : '180px',
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom',
              transform: isOpen ? 'rotateX(-180deg) translateY(-100%)' : 'rotateX(0deg)',
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? 'none' : 'auto'
            }}
            onClick={() => !isOpen && togglePhone()}
          >
            {/* Closed State - External Screen */}
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 rounded-full bg-[#E68961]/20 flex items-center justify-center mb-3 animate-pulse-golden">
                <svg className="w-8 h-8 text-[#E68961]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="text-[#E68961] text-base font-bold font-mono mb-1">ACHEEVY</div>
              <div className="text-gray-400 text-xs">Click to Open</div>
              <div className="mt-2 px-3 py-1 bg-[#E68961]/10 rounded-full">
                <span className="text-[#E68961] text-[10px] font-mono">VOICE FIRST</span>
              </div>
              <style jsx>{`
                @keyframes pulse-golden {
                  0%, 100% {
                    box-shadow: 0 0 0 0 rgba(230, 137, 97, 0.7);
                    transform: scale(1);
                  }
                  50% {
                    box-shadow: 0 0 0 10px rgba(230, 137, 97, 0);
                    transform: scale(1.05);
                  }
                }
                .animate-pulse-golden {
                  animation: pulse-golden 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
              `}</style>
            </div>
          </div>

          {/* Bottom Half (Main Screen) - Full Height When Open */}
          <div 
            className="absolute inset-x-0 bg-black border-2 border-[#E68961] rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(230,137,97,0.4)] transition-all duration-700 ease-in-out"
            style={{
              bottom: 0,
              height: isOpen ? '640px' : '180px',
              opacity: isOpen ? 1 : 0.3
            }}
          >
            {/* Phone Screen */}
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="bg-gray-900 border-b border-[#E68961]/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#E68961] animate-pulse" />
                  <span className="text-white font-bold text-sm">ACHEEVY Voice</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Sound Toggle */}
                  <button
                    onClick={toggleSounds}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                  >
                    {soundsEnabled ? (
                      <svg className="w-4 h-4 text-[#E68961]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  {/* Close Button */}
                  <button
                    onClick={togglePhone}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-[#E68961]/20 flex items-center justify-center mb-3 animate-pulse-golden">
                      <svg className="w-12 h-12 text-[#E68961]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <p className="mb-1 text-white">Voice FIRST, Text Second</p>
                    <p className="text-xs text-gray-400">Start speaking to ACHEEVY</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.role === 'user'
                            ? 'bg-[#E68961] text-black'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Voice Input Overlay - Fixed Position to Prevent Jumping */}
              {showVoiceInput && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-20 rounded-3xl">
                  <div className="w-full max-w-sm">
                    <VoiceRecorder
                      onTranscript={handleVoiceTranscript}
                      onError={(err) => {
                        console.error(err);
                        setShowVoiceInput(false);
                      }}
                      autoStart={true}
                    />
                    <button
                      onClick={() => setShowVoiceInput(false)}
                      className="mt-6 w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-[#E68961]/30 p-3 bg-gray-900">
                <div className="flex items-center gap-2">
                  {/* Voice Button */}
                  <button
                    onClick={() => setShowVoiceInput(true)}
                    className="w-10 h-10 rounded-full bg-[#E68961] hover:bg-[#D4A05F] flex items-center justify-center transition-colors shrink-0"
                  >
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type or speak..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E68961]"
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                  >
                    <svg className="w-5 h-5 text-[#E68961]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
