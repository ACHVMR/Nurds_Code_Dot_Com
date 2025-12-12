import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PromptToCode from './pages/PromptToCode';
import Pricing from './pages/Pricing';
import Subscribe from './pages/Subscribe';
import Success from './pages/Success';
import Editor from './pages/Editor';
import CircuitBox from './pages/CircuitBox';
import TestingLab from './pages/TestingLab';
import Workbench from './pages/Workbench';
import AgentBuilder from './pages/AgentBuilder';
import ToolCatalog from './pages/ToolCatalog';
import NURD from './pages/NURD';
import { RoleProvider } from './context/RoleContext';
import { DepartmentProvider } from './context/DepartmentContext';
import DepartmentSidebar from './components/DepartmentSidebar';
import ACHEEVYPanel from './components/ACHEEVYPanel';
import VibeIdeShell from './components/ide/VibeIdeShell';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import Settings from './pages/Settings';
import Deploy from './pages/Deploy';
import Vibe from './pages/Vibe';
import Build from './pages/Build';
import PlugStore from './pages/PlugStore';

function App() {
  const [appLoading, setAppLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Fast load - reduced from 2000ms to 500ms
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (appLoading) {
    return <LoadingScreen message="Loading Nurds Code" />;
  }

  // Full-screen pages (no sidebar)
  const isFullscreen = 
    location.pathname.startsWith('/vibe-ide') ||
    location.pathname === '/code';

  if (isFullscreen) {
    return (
      <RoleProvider>
        <DepartmentProvider>
          <Routes location={location}>
            <Route path="/vibe-ide" element={<VibeIdeShell />} />
            <Route path="/code" element={<PromptToCode />} />
          </Routes>
        </DepartmentProvider>
      </RoleProvider>
    );
  }

  return (
    <RoleProvider>
      <DepartmentProvider>
        <div className="min-h-screen flex bg-[#0A0A0A] text-white">
          {/* Sidebar */}
          <DepartmentSidebar />
          
          {/* Main Content */}
          <main className="grow flex flex-col" style={{ marginLeft: '240px', width: 'calc(100% - 240px)' }}>
            <Navbar />
            
            <div className="grow">
              <Routes location={location}>
                {/* 🏠 HOME */}
                <Route path="/" element={<Home />} />
                
                {/* ⌨️ PROMPT TO CODE (main product) */}
                <Route path="/code" element={<PromptToCode />} />
                
                {/* ⚙️ SETTINGS */}
                <Route path="/settings/*" element={<Settings />} />
                
                {/* 🚀 DEPLOY */}
                <Route path="/deploy/*" element={<Deploy />} />
                
                {/* 🧪 TESTING LAB */}
                <Route path="/testing-lab/*" element={<TestingLab />} />
                
                {/* 💻 V.I.B.E. */}
                <Route path="/vibe/*" element={<Vibe />} />
                
                {/* 🔨 BUILD */}
                <Route path="/build/*" element={<Build />} />
                
                {/* 🔌 PLUG STORE */}
                <Route path="/plugstore/*" element={<PlugStore />} />

                {/* Other Routes */}
                <Route path="/editor" element={<Editor />} />
                <Route path="/admin" element={<ProtectedRoute requiredRole="owner"><CircuitBox /></ProtectedRoute>} />
                <Route path="/nurd" element={<NURD />} />
                <Route path="/agents" element={<AgentBuilder />} />
                <Route path="/tools" element={<ToolCatalog />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="/success" element={<Success />} />
              </Routes>
            </div>
            
            <Footer />
          </main>
          
          {/* Floating Chat */}
          <ACHEEVYPanel />
        </div>
      </DepartmentProvider>
    </RoleProvider>
  );
}

export default App;
