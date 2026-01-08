import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, FileCode, Video, Sparkles, Brain, Zap, Crown, ArrowRight } from 'lucide-react';
import { extractCodeFromImage, cloneProjectFromScreenshot } from '../services/ocr.js';
import { generateVideoFromMedia } from '../services/kieai.js';
import { useUser } from '@clerk/clerk-react';
import TerminologyTicker from '../components/TerminologyTicker';

/**
 * Home Page - VIBE Boardroom Interface
 * Clean, full-width layout without device bezels
 * Primary CTA: Chat w/ACHEEVY
 */
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
      {/* Hero Section - VIBE Boardroom */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:32px_32px]" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-2xl shadow-purple-500/30 mb-8">
              <Brain className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-white">
              Ready to Think It,<br/>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Prompt It, and Build It?
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join NurdsCode today and turn your ideas into reality. 
              Start your journey as a tech innovator now!
            </p>

            {/* Primary CTA - Chat w/ACHEEVY */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/chat-acheevy" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold text-lg rounded-xl transition-all shadow-xl shadow-purple-500/25"
              >
                <Brain className="w-5 h-5" />
                <span>Chat w/ACHEEVY</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/pricing" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-semibold text-lg rounded-xl transition-all"
              >
                Learn More
              </Link>
            </div>

            {/* Mode Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-amber-500/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Brainstorm</h3>
                <p className="text-sm text-gray-500">Clarify direction, reduce uncertainty, assess your skill level</p>
              </div>
              <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-blue-500/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 mx-auto">
                  <FileCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Forming</h3>
                <p className="text-sm text-gray-500">Turn ideas into buildable specs with the 4-Question Lens</p>
              </div>
              <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">King Mode</h3>
                <p className="text-sm text-gray-500">Full 19 II-agent swarm deployment with verification</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Drop Zone Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-950/50">
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
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
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  Drop files here or click to upload
                </h3>
                
                <p className="text-sm text-gray-500 mb-6">
                  📸 Screenshot → Code extraction<br />
                  🎨 Image + Audio → AI Video<br />
                  🤖 Powered by Kie.ai & OCR
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-[#E68961] mx-auto mb-4 animate-spin" />
                <p className="text-white font-semibold">{processingMessage}</p>
                {uploadedFile && (
                  <p className="text-sm text-gray-500 mt-2">{uploadedFile.name}</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <div className="text-2xl font-bold text-[#E68961]">OCR</div>
              <div className="text-xs text-gray-500">Code Extract</div>
            </div>
            <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <div className="text-2xl font-bold text-purple-400">AI</div>
              <div className="text-xs text-gray-500">Video Gen</div>
            </div>
            <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <div className="text-2xl font-bold text-cyan-400">24/7</div>
              <div className="text-xs text-gray-500">Support</div>
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
    </div>
  );
}

export default Home;
