import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar'; // Keeping Navbar for top header if needed, or might be redundant? Let's keep for now as Header.
import Footer from './components/Footer';
import Home from './pages/Home';
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
import { DepartmentProvider } from './context/DepartmentContext'; // New Context
import DepartmentSidebar from './components/DepartmentSidebar'; // New Sidebar
import ACHEEVYPanel from './components/ACHEEVYPanel'; // DeepMind Chat Panel
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
    // Simulate initial app load time
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (appLoading) {
    return <LoadingScreen message="Loading Nurds Code Platform" />;
  }

  // Fullscreen IDE Mode check
  const isIdeMode = location.pathname.startsWith('/vibe-ide');

  return (
    <RoleProvider>
      <DepartmentProvider>
        {isIdeMode ? (
          <Routes location={location}>
            <Route path="/vibe-ide" element={<VibeIdeShell />} />
          </Routes>
        ) : (
          <div className="min-h-screen flex bg-black text-white">
            {/* New Fixed Sidebar */}
            <DepartmentSidebar />
            
            {/* Main Content Area - Pushed to right by 240px */}
            <main className="grow flex flex-col" style={{ marginLeft: '240px', width: 'calc(100% - 240px)' }}>
              <Navbar /> {/* Optional: Keep top navbar for global search/actions if desired, or remove if Sidebar handles all */}
              
              <div className="grow p-4">
                <div key={location.pathname} className="animate-fade-in-up h-full">
                  <Routes location={location}>
                    {/* 🏠 HOME */}
                    <Route path="/" element={<Home />} />
                    
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

                    {/* Legacy / Shared Routes (mapped to departments later) */}
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
              </div>
              
              <Footer />
            </main>
            
            {/* Floating ACHEEVY Chat Panel */}
            <ACHEEVYPanel />
          </div>
        )}
      </DepartmentProvider>
    </RoleProvider>
  );
}

export default App;
