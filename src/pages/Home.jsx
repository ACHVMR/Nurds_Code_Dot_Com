import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, FileCode, Video, Sparkles } from 'lucide-react';
import { extractCodeFromImage, cloneProjectFromScreenshot } from '../services/ocr.js';
import { generateVideoFromMedia } from '../services/kieai.js';
import { useUser } from '@clerk/clerk-react';
import PhoneSelector from '../components/phones/PhoneSelector';
import TerminologyTicker from '../components/TerminologyTicker';
import NextelPhone from '../components/NextelPhone';

function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();

  const handleVoiceMessage = async (message) => {
    console.log('Voice message received:', message);
    // Send to AI for processing
    navigate('/editor', { state: { voicePrompt: message } });
  };

  const handleVoiceRecord = async (audioBlob) => {
    console.log('Voice recording completed:', audioBlob);
    // Handle voice recording
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setUploadedFile(file);
    setProcessing(true);

    try {
      // Check file type
      if (file.type.startsWith('image/')) {
        setProcessingMessage('Extracting code from image...');
        
        // Use OCR to extract code
        const result = await cloneProjectFromScreenshot(file);
        
        setProcessingMessage('Code extracted! Redirecting to editor...');
        
        // Redirect to editor with extracted code
        setTimeout(() => {
          navigate('/editor', {
            state: {
              code: result.code,
              language: result.language,
              projectName: result.projectName,
              fromOCR: true
            }
          });
        }, 1000);
      } else {
        setProcessingMessage('File uploaded!');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Processing failed:', error);
      setProcessingMessage(`Error: ${error.message}`);
      setTimeout(() => {
        setProcessing(false);
        setUploadedFile(null);
        setProcessingMessage('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with NURD Logo */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text & CTA */}
            <div className="text-center lg:text-left">
              <h1 className="tagline mb-6 sm:mb-8">
                Think It. Prompt It. Build It.
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-text mb-8 sm:mb-12 max-w-2xl mx-auto lg:mx-0">
                Build powerful applications with modern tools and workflows. 
                <span className="block mt-4 text-[#E68961]">
                  Talk to ACHEEVY • Voice-First Development ✨
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/subscribe" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                  Start Building Now
                </Link>
                <Link to="/pricing" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                  View Pricing
                </Link>
                <Link to="/web3" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-[#D946EF] hover:bg-[#C740D9]">
                  🔗 Web3 Platform
                </Link>
              </div>
            </div>

            {/* Right Column - Nextel Phone */}
            <div className="flex flex-col items-center gap-8">
              {/* Nextel Phone - Primary Interaction */}
              <div className="w-full max-w-md mx-auto">
                <NextelPhone defaultOpen={false} />
              </div>

              {/* Upload Drop Zone */}
              <div
                className={`relative w-full max-w-md mx-auto border-2 border-dashed rounded-2xl p-8 transition-all ${
                  dragActive
                    ? 'border-[#E68961] bg-[#E68961]/10'
                    : 'border-[#2a2a2a] bg-[#1a1a1a]/50 hover:border-[#E68961]/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                  accept="image/*,audio/*"
                />

                {!processing ? (
                  <div className="text-center">
                    <div className="flex justify-center gap-3 mb-4">
                      <ImageIcon className="w-8 h-8 text-[#E68961]" />
                      <FileCode className="w-8 h-8 text-purple-400" />
                      <Video className="w-8 h-8 text-cyan-400" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-text mb-2">
                      Drop files here or click to upload
                    </h3>
                    
                    <p className="text-sm text-text/60 mb-6">
                      📸 Screenshot → Code extraction<br />
                      🎨 Image + Audio → AI Video<br />
                      🤖 Powered by Kie.ai & OCR
                    </p>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary flex items-center gap-2 mx-auto"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-[#E68961] mx-auto mb-4 animate-spin" />
                    <p className="text-text font-semibold">{processingMessage}</p>
                    {uploadedFile && (
                      <p className="text-sm text-text/60 mt-2">{uploadedFile.name}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto text-center">
                <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                  <div className="text-2xl font-bold text-[#E68961]">OCR</div>
                  <div className="text-xs text-text/60">Code Extract</div>
                </div>
                <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                  <div className="text-2xl font-bold text-purple-400">AI</div>
                  <div className="text-xs text-text/60">Video Gen</div>
                </div>
                <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                  <div className="text-2xl font-bold text-cyan-400">24/7</div>
                  <div className="text-xs text-text/60">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Navigation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-text">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* DEPLOY Card */}
            <Link 
              to="/deploy/workbench" 
              className="qa-card qa-deploy-card group relative overflow-hidden rounded-xl p-8 hover:bg-[#1a1a1a]/80 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E68961]/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="qa-card-title text-2xl font-bold mb-3">DEPLOY</h3>
                <p className="text-text/80 mb-4">
                  Launch your code with Monaco editor, file management, and one-click export to production.
                </p>
                <div className="flex items-center gap-2 qa-cta">
                  <span>Open Workbench</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Nurds Code Card */}
            <Link 
              to="/editor" 
              className="qa-card qa-nurds-card group relative overflow-hidden rounded-xl p-8 hover:bg-[#1a1a1a]/80 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="text-5xl mb-4">💻</div>
                <h3 className="qa-card-title text-2xl font-bold mb-3">Nurds Code</h3>
                <p className="text-text/80 mb-4">
                  Build full-stack applications with AI-powered code generation and live preview.
                </p>
                <div className="flex items-center gap-2 qa-cta">
                  <span>Start Coding</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Testing Lab Card */}
            <Link 
              to="/deploy/testing-lab" 
              className="qa-card qa-testing-card group relative overflow-hidden rounded-xl p-8 hover:bg-[#1a1a1a]/80 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="text-5xl mb-4">🧪</div>
                <h3 className="qa-card-title text-2xl font-bold mb-3">Testing Lab</h3>
                <p className="text-text/80 mb-4">
                  Run automated tests with Playwright, monitor results, and ensure code quality.
                </p>
                <div className="flex items-center gap-2 qa-cta">
                  <span>Run Tests</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-text">
            Powerful Features for Modern Developers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4 text-accent">Lightning Fast</h3>
              <p className="text-text">
                Built on Cloudflare's global network for unparalleled performance and reliability.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-4 text-accent">Secure & Scalable</h3>
              <p className="text-text">
                Enterprise-grade security with authentication and D1 database integration.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-4 text-accent">Developer-First</h3>
              <p className="text-text">
                Intuitive interface and powerful tools designed for developers, by developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terminology Ticker - Fixed Bottom */}
      <TerminologyTicker />

      {/* Phone Selector - Voice Interface */}
      {user && (
        <PhoneSelector 
          userId={user.id}
          onMessageSend={handleVoiceMessage}
          onVoiceRecord={handleVoiceRecord}
        />
      )}
    </div>
  );
}

export default Home;
