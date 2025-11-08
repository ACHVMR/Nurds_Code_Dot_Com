import React from 'react';
import Navbar from './Navbar';
import ClerkVersionMonitor from './ClerkVersionMonitor';
import './Layout.css';

const Layout = ({ children }) => {
  const isDev = import.meta.env.MODE === 'development';
  
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      {isDev && <ClerkVersionMonitor />}
    </div>
  );
};

export default Layout;
