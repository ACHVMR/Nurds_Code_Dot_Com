import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Subscribe from './pages/Subscribe';
import Success from './pages/Success';
import Editor from './pages/Editor';
import Admin from './pages/Admin';
import AgentBuilder from './pages/AgentBuilder';
import Auth from './pages/Auth';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
  <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/success" element={<Success />} />
          <Route path="/editor" element={<RequireAuth><Editor /></RequireAuth>} />
          <Route path="/agents" element={<RequireAuth><AgentBuilder /></RequireAuth>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
