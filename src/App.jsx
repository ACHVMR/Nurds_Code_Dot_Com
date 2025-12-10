import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Subscribe from './pages/Subscribe';
import Success from './pages/Success';
import Editor from './pages/Editor';
import CircuitBox from './pages/CircuitBox';
import TestingLab from './pages/TestingLabV2';
import Workbench from './pages/Workbench';
import AgentBuilderV2 from './pages/AgentBuilderV2';
import ToolCatalog from './pages/ToolCatalog';
import NURD from './pages/NURD';
import { RoleProvider } from './context/RoleContext';
import SmartSidePanel from './components/SmartSidePanel';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

// Import fonts for NURD OS theme
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource-variable/doto';

/**
 * Nurds Code - The IDE Platform
 * Built on Cloudflare Vibecoding SDK
 * 
 * ARCHITECTURE:
 * - Nurds Code = The IDE (this platform)
 * - Deploy Platform = ACHEEVY-centered platform (separate but connected)
 * 
 * MODULES:
 * - Vibe Coding (Editor) - Build full-stack apps with AI
 * - Deploy Platform (Admin) - Manage deployments (links to separate platform)
 * - NURD - Training, workshops, community
 * - Testing Lab (Workbench) - Experiment with OSS APIs
 */

function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app load time
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (appLoading) {
    return <LoadingScreen message="Loading Nurds Code Platform" />;
  }

  return (
    <RoleProvider>
      <div className="min-h-screen flex flex-col">
        <SmartSidePanel />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Landing Page - New NURD OS styled landing */}
            <Route path="/landing" element={<Landing />} />
            
            {/* Hub - Main Dashboard */}
            <Route path="/" element={<Home />} />
            
            {/* Circuit Box Dashboard - System Management */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Vibe Coding - IDE */}
            <Route path="/editor" element={<Editor />} />
            
            {/* Deploy Platform - Links to ACHEEVY-centered platform */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="owner">
                <CircuitBox />
              </ProtectedRoute>
            } />
            <Route path="/circuit-box" element={
              <ProtectedRoute requiredRole="owner">
                <CircuitBox />
              </ProtectedRoute>
            } />
            
            {/* NURD - Training & Community */}
            <Route path="/nurd" element={<NURD />} />
            
            {/* Testing Lab / Workbench */}
            <Route path="/workbench" element={<TestingLab />} />
            <Route path="/testing-lab" element={<TestingLab />} />
            
            {/* Boomer_Angs - Agent Builder */}
            <Route path="/agents" element={<AgentBuilderV2 />} />
            
            {/* Tool Catalog - SmelterOS Tools */}
            <Route path="/tools" element={<ToolCatalog />} />
            
            {/* Pricing & Subscription */}
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </RoleProvider>
  );
}

export default App;
