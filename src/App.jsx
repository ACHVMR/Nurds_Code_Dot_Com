import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';
import Subscribe from './pages/Subscribe';
import SignUp from './pages/SignUp';
import Auth from './pages/Auth';
import PricingPlusOne from './pages/PricingPlusOne';
import OAuthCallback from './pages/OAuthCallback';
import Onboarding from './pages/Onboarding';
import Editor from './pages/Editor';
import DailyInsights from './pages/DailyInsights';
import AgentBuilder from './pages/AgentBuilder';
import CustomInstructions from './pages/CustomInstructions';
import UsageLedger from './pages/UsageLedger';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ACHEEVYIntent from './pages/ACHEEVYIntent';
import LiveBuildEditor from './pages/LiveBuildEditor';
import ACHEEVY from './pages/ACHEEVY';
import TestPermissions from './pages/TestPermissions';
import ValidationResults from './pages/ValidationResults';
import Dashboard from './pages/Dashboard';

// Voice-First Platform Pages
import VoiceProfileSettings from './pages/VoiceProfileSettings';

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


// Component that handles dev mode auth (no Clerk)
function AppWithDevAuth() {
  // In dev mode, simulate signed in for testing protected routes
  const isSignedIn = import.meta.env.DEV;
  const user = isSignedIn ? { id: 'dev-user', emailAddresses: [{ emailAddress: 'dev@nurdscode.com' }] } : null;
  const isSuperAdmin = false;
  const deployEnabled = import.meta.env.VITE_DEPLOY_ENABLED === 'true';
  
  return <AppContent isSignedIn={isSignedIn} user={user} isSuperAdmin={isSuperAdmin} deployEnabled={deployEnabled} />;
}

// Component that handles no auth (development mode)
function AppWithoutAuth() {
  const isSignedIn = false;
  const user = null;
  const isSuperAdmin = false;
  const deployEnabled = import.meta.env.VITE_DEPLOY_ENABLED === 'true';
  
  return <AppContent isSignedIn={isSignedIn} user={user} isSuperAdmin={isSuperAdmin} deployEnabled={deployEnabled} />;
}

// Main app content component
function AppContent({ isSignedIn, user, isSuperAdmin, deployEnabled }) {

  return (
    <Layout isSignedIn={isSignedIn} user={user}>
      <Routes>
        {/* Landing Page (Immersive - No Layout Chrome) */}
        <Route path="/welcome" element={<LandingPage />} />
        
        {/* Public Routes */}
        <Route path="/" element={<Home user={user} />} />
  <Route path="/pricing" element={<Pricing />} />
  <Route path="/pricing/plus-one" element={<PricingPlusOne />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/auth/signup" element={<Navigate to="/auth" />} />
        
        {/* OAuth Callback Routes */}
        <Route path="/auth/callback/google" element={<OAuthCallback />} />
        <Route path="/auth/callback/github" element={<OAuthCallback />} />
        
        {/* Auth Routes */}
        <Route path="/auth/onboarding" element={
          isSignedIn ? <Onboarding /> : <Navigate to="/auth/signup" />
        } />

        <Route path="/test-permissions" element={<TestPermissions />} />
        
        {/* Protected Routes */}
        <Route path="/subscribe" element={
          isSignedIn ? <Subscribe /> : <Navigate to="/auth" />
        } />
        
        <Route path="/editor" element={
          isSignedIn ? <Editor /> : <Navigate to="/" />
        } />
        
        <Route path="/editor/:projectId" element={
          isSignedIn ? <LiveBuildEditor /> : <Navigate to="/" />
        } />

        <Route path="/editor/results" element={
          isSignedIn ? <ValidationResults /> : <Navigate to="/" />
        } />

        <Route path="/dashboard" element={
          isSignedIn ? <Dashboard /> : <Navigate to="/" />
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
        
        {/* Chat wACHEEVY - II-Agent Interface */}
        <Route path="/chat-acheevy" element={
          isSignedIn ? <ACHEEVY /> : <Navigate to="/" />
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

// Main App component - uses dev auth for now
function App() {
  return <AppWithDevAuth />;
}

export default App;
