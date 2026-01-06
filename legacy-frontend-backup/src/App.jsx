import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PromptToCode from './pages/PromptToCode';
import TestingLab from './pages/TestingLab';
import Vibe from './pages/Vibe';
import Deploy from './pages/Deploy';
import AgentBuilder from './pages/AgentBuilder';
import CircuitBox from './pages/CircuitBox';
import ToolCatalog from './pages/ToolCatalog';
import { RoleProvider } from './context/RoleContext';
import { DepartmentProvider } from './context/DepartmentContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading" />;
  }

  return (
    <RoleProvider>
      <DepartmentProvider>
        <Routes location={location}>
          {/* Home */}
          <Route path="/" element={<Home />} />
          
          {/* Main Prompt-to-Code Interface */}
          <Route path="/code" element={<PromptToCode />} />
          
          {/* V.I.B.E. */}
          <Route path="/vibe/*" element={<Vibe />} />
          
          {/* Testing Lab */}
          <Route path="/testing-lab/*" element={<TestingLab />} />
          
          {/* Deploy (Placeholder) */}
          <Route path="/deploy/*" element={<Deploy />} />
          
          {/* Agent Builder */}
          <Route path="/agents" element={<AgentBuilder />} />
          
          {/* Admin Only Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="owner">
              <CircuitBox />
            </ProtectedRoute>
          } />
          
          {/* Tool Catalog - Admin Only */}
          <Route path="/tools" element={
            <ProtectedRoute requiredRole="owner">
              <ToolCatalog />
            </ProtectedRoute>
          } />
        </Routes>
      </DepartmentProvider>
    </RoleProvider>
  );
}

export default App;
