import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

console.log('🔍 Working App: Clean architecture without auth dependencies');

function SimpleLayout({ children }) {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#000', 
      color: '#39FF14',
      fontFamily: 'monospace'
    }}>
      {/* Simple Navbar */}
      <nav style={{ 
        padding: '10px 20px', 
        background: '#111', 
        borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>🚀 Nurds Code</h2>
          <Link to="/" style={{ color: '#39FF14', textDecoration: 'none' }}>Home</Link>
          <Link to="/pricing" style={{ color: '#39FF14', textDecoration: 'none' }}>Pricing</Link>
          <Link to="/auth" style={{ color: '#39FF14', textDecoration: 'none' }}>Auth</Link>
        </div>
      </nav>
      
      {/* Main Content */}
      <main style={{ padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <div>
      <h1>🎉 Working Version: Clean Architecture!</h1>
      
      {/* Hero Section */}
      <section style={{ 
        padding: '40px 0', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        borderRadius: '10px',
        margin: '20px 0'
      }}>
        <h2 style={{ fontSize: '3rem', margin: '0 0 20px 0' }}>
          Think It. Prompt It. Build It.
        </h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          A modern development platform built on Cloudflare
        </p>
      </section>

      {/* Quick Access Cards */}
      <section style={{ margin: '40px 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Quick Access</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={{ 
            background: '#1a1a1a', 
            padding: '30px', 
            borderRadius: '10px',
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚀</div>
            <h3 style={{ color: '#E68961', marginBottom: '15px' }}>DEPLOY</h3>
            <p style={{ opacity: 0.8 }}>
              Launch your code with Monaco editor, file management, and one-click export to production.
            </p>
          </div>
          
          <div style={{ 
            background: '#1a1a1a', 
            padding: '30px', 
            borderRadius: '10px',
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💻</div>
            <h3 style={{ color: '#9333ea', marginBottom: '15px' }}>Nurds Code</h3>
            <p style={{ opacity: 0.8 }}>
              Build full-stack applications with AI-powered code generation and live preview.
            </p>
          </div>
          
          <div style={{ 
            background: '#1a1a1a', 
            padding: '30px', 
            borderRadius: '10px',
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🧪</div>
            <h3 style={{ color: '#06b6d4', marginBottom: '15px' }}>Testing Lab</h3>
            <p style={{ opacity: 0.8 }}>
              Run automated tests with Playwright, monitor results, and ensure code quality.
            </p>
          </div>
        </div>
      </section>

      <div style={{ 
        background: '#1a1a1a', 
        padding: '20px', 
        borderRadius: '10px',
        marginTop: '40px',
        textAlign: 'center'
      }}>
        <p>✅ Clean Architecture: No auth dependencies, no hook violations!</p>
        <p>🎯 Ready for gradual component integration</p>
      </div>
    </div>
  );
}

function PricingPage() {
  return (
    <div>
      <h1>💰 Pricing Page</h1>
      <p>This is the pricing page!</p>
    </div>
  );
}

function AuthPage() {
  return (
    <div>
      <h1>🔐 Auth Page</h1>
      <p>This is the auth page!</p>
    </div>
  );
}

function App() {
  return (
    <SimpleLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </SimpleLayout>
  );
}

export default App;