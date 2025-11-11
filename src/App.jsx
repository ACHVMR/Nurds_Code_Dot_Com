import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Subscribe from './pages/Subscribe';
import SignUp from './pages/SignUp';
import Onboarding from './pages/Onboarding';
import Editor from './pages/Editor';
import DailyInsights from './pages/DailyInsights';
import AgentBuilder from './pages/AgentBuilder';
import CustomInstructions from './pages/CustomInstructions';
import UsageLedger from './pages/UsageLedger';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ACHEEVYIntent from './pages/ACHEEVYIntent';
import LiveBuildEditor from './pages/LiveBuildEditor';

// Voice-First Platform Pages
import VoiceProfileSettings from './pages/VoiceProfileSettings';
import PhoneTest from './pages/PhoneTest';

// Phase 1 Setup
import Phase1Setup from './pages/Phase1Setup';

// C1 Thesys Card-Based UI
import C1Examples from './pages/C1Examples';

// Boomer_Ang Dashboard
import BoomerAngDashboard from './pages/BoomerAngDashboard';

// Audio Settings
import AudioSettings from './pages/AudioSettings';

// Deploy Features (lazy-loaded for performance)
const DeployWorkbench = lazy(() => import('./pages/DeployWorkbench'));
const DeployTestingLab = lazy(() => import('./pages/DeployTestingLab'));


function App() {
  const { isSignedIn, user } = useAuth();
  
  // Check if user is SuperAdmin
  const isSuperAdmin = user?.emailAddresses?.[0]?.emailAddress === 'owner@nurdscode.com';
  
  // Feature flag for Deploy features (can be controlled via env var or user role)
  const deployEnabled = process.env.REACT_APP_DEPLOY_ENABLED === 'true' || isSuperAdmin;

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth/signup" element={<SignUp />} />
        
        {/* Auth Routes */}
        <Route path="/auth/onboarding" element={
          isSignedIn ? <Onboarding /> : <Navigate to="/auth/signup" />
        } />
        
        {/* Protected Routes */}
        <Route path="/subscribe" element={
          isSignedIn ? <Subscribe /> : <Navigate to="/" />
        } />
        
        <Route path="/editor" element={
          isSignedIn ? <Editor /> : <Navigate to="/" />
        } />
        
        <Route path="/editor/:projectId" element={
          isSignedIn ? <LiveBuildEditor /> : <Navigate to="/" />
        } />
        
        <Route path="/insights" element={
          isSignedIn ? <DailyInsights /> : <Navigate to="/" />
        } />
        
        <Route path="/voice-settings" element={
          isSignedIn ? <VoiceProfileSettings /> : <Navigate to="/" />
        } />
        
        <Route path="/agents" element={
          isSignedIn ? <AgentBuilder /> : <Navigate to="/" />
        } />
        
        <Route path="/custom-instructions" element={
          isSignedIn ? <CustomInstructions /> : <Navigate to="/" />
        } />
        
        <Route path="/usage" element={
          isSignedIn ? <UsageLedger /> : <Navigate to="/" />
        } />
        
        <Route path="/acheevy/:ideaId?" element={
          isSignedIn ? <ACHEEVYIntent /> : <Navigate to="/" />
        } />
        
        <Route path="/phone-test" element={
          isSignedIn ? <PhoneTest /> : <Navigate to="/" />
        } />
        
        <Route path="/phase1-setup" element={
          isSignedIn ? <Phase1Setup /> : <Navigate to="/" />
        } />
        
        {/* C1 Thesys Examples (Development/Testing) */}
        <Route path="/c1-examples" element={<C1Examples />} />
        
        {/* Boomer_Ang Dashboard - AI Agent Marketplace */}
        <Route path="/boomer-angs" element={
          isSignedIn ? <BoomerAngDashboard /> : <Navigate to="/" />
        } />
        
        {/* Audio Settings - Customize notification sounds */}
        <Route path="/audio-settings" element={
          isSignedIn ? <AudioSettings /> : <Navigate to="/" />
        } />
        
        {/* Deploy Features - Lazy-loaded, feature-flagged */}
        {deployEnabled && (
          <>
            <Route path="/deploy/workbench" element={
              isSignedIn ? (
                <Suspense fallback={<div style={{ padding: '2rem', color: '#fff' }}>Loading Workbench...</div>}>
                  <DeployWorkbench />
                </Suspense>
              ) : <Navigate to="/auth/signup" />
            } />
            
            <Route path="/deploy/testing-lab" element={
              isSignedIn ? (
                <Suspense fallback={<div style={{ padding: '2rem', color: '#fff' }}>Loading Testing Lab...</div>}>
                  <DeployTestingLab />
                </Suspense>
              ) : <Navigate to="/auth/signup" />
            } />
          </>
        )}
        
        {/* SuperAdmin Only */}
        <Route path="/admin" element={
          isSuperAdmin ? <SuperAdminDashboard /> : <Navigate to="/" />
        } />
      </Routes>
    </Layout>
  );
}

export default App;
