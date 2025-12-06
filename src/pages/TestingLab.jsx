import React from 'react';
import { Link } from 'react-router-dom';

function TestingLab() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--nqno-banana-bg-primary)', color: 'var(--nqno-banana-text-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--nqno-banana-font-display)' }}>
            Testing Lab
          </h1>
          <p className="text-xl" style={{ color: 'var(--nqno-banana-text-secondary)' }}>
            Experiment with Vibe Code examples and voice capabilities.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Example Project 1 */}
          <div className="p-6 rounded-xl transition-all hover:shadow-lg" 
               style={{ 
                 background: 'var(--nqno-banana-bg-secondary)', 
                 borderRadius: 'var(--nqno-banana-radius-lg)',
                 boxShadow: 'var(--nqno-banana-shadow-md)'
               }}>
            <div className="h-40 mb-4 rounded-lg bg-gray-300 flex items-center justify-center">
              <span className="text-4xl">🔢</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Simple Counter</h3>
            <p className="mb-4 text-sm opacity-80">A beginner-friendly example of state management.</p>
            <button className="px-4 py-2 rounded-lg font-bold w-full"
                    style={{ background: 'var(--nqno-banana-accent)', color: 'black' }}>
              Launch Demo
            </button>
          </div>

          {/* Example Project 2 */}
          <div className="p-6 rounded-xl transition-all hover:shadow-lg" 
               style={{ 
                 background: 'var(--nqno-banana-bg-secondary)', 
                 borderRadius: 'var(--nqno-banana-radius-lg)',
                 boxShadow: 'var(--nqno-banana-shadow-md)'
               }}>
            <div className="h-40 mb-4 rounded-lg bg-gray-300 flex items-center justify-center">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Todo App</h3>
            <p className="mb-4 text-sm opacity-80">Intermediate example with local storage.</p>
            <button className="px-4 py-2 rounded-lg font-bold w-full"
                    style={{ background: 'var(--nqno-banana-accent)', color: 'black' }}>
              Launch Demo
            </button>
          </div>

          {/* Example Project 3 */}
          <div className="p-6 rounded-xl transition-all hover:shadow-lg" 
               style={{ 
                 background: 'var(--nqno-banana-bg-secondary)', 
                 borderRadius: 'var(--nqno-banana-radius-lg)',
                 boxShadow: 'var(--nqno-banana-shadow-md)'
               }}>
            <div className="h-40 mb-4 rounded-lg bg-gray-300 flex items-center justify-center">
              <span className="text-4xl">🤝</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Collab Board</h3>
            <p className="mb-4 text-sm opacity-80">Advanced real-time collaboration with Durable Objects.</p>
            <button className="px-4 py-2 rounded-lg font-bold w-full"
                    style={{ background: 'var(--nqno-banana-accent)', color: 'black' }}>
              Launch Demo
            </button>
          </div>
        </div>

        <section className="mb-16 p-8 rounded-2xl" style={{ background: 'var(--nqno-banana-bg-tertiary)' }}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--nqno-banana-font-display)' }}>
                Voice Interface Demo
              </h2>
              <p className="mb-6">
                Experience the power of ACHEEVY. Speak naturally to generate code, debug issues, or optimize your workflow.
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                        style={{ background: 'var(--nqno-banana-accent)', color: 'black' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  Try Voice Demo
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-inner">
              <div className="text-sm text-gray-500 mb-2">ACHEEVY Transcript</div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg rounded-tl-none">
                  "Show me how to implement a counter."
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg rounded-tr-none ml-auto text-right">
                  "Here is a simple counter component using React hooks..."
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TestingLab;
