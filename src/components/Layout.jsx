import React from 'react';
import Navbar from './Navbar';
import ClerkVersionMonitor from './ClerkVersionMonitor';
// import './Layout.css';

const Layout = ({ children, isSignedIn, user }) => {
  const isDev = import.meta.env.MODE === 'development';
  
  console.log('🔍 Layout rendering with:', { isSignedIn, user: user?.id || 'null', childrenType: typeof children });
  
  return (
    <div className="app-layout" style={{ minHeight: '100vh', background: '#000' }}>
      <div style={{ padding: '10px', background: '#333', color: '#39FF14', fontSize: '12px' }}>
        🔍 DEBUG: Layout loaded - Auth: {isSignedIn ? 'YES' : 'NO'} | User: {user?.id || 'null'}
      </div>
      <Navbar isSignedIn={isSignedIn} user={user} />
      <main className="main-content">
        <div style={{ padding: '10px', background: '#444', color: '#39FF14', fontSize: '12px' }}>
          🔍 DEBUG: Main content area - Children type: {typeof children}
        </div>
        {children}
      </main>
      {/* {isDev && <ClerkVersionMonitor />} */}
    </div>
  );
};

export default Layout;
