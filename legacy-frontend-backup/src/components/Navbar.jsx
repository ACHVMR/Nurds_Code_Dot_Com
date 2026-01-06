import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Navbar - Matte Black Theme
 * Clean, minimal top navigation
 */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Nurds Code', path: '/', isLogo: true },
    { name: 'Hub', path: '/', icon: '🏠' },
    { name: 'V.I.B.E.', path: '/vibe/editor', icon: '</>' },
    { name: 'Testing Lab', path: '/testing-lab', icon: '🧪' },
    { name: 'Boomer_Angs', path: '/agents', icon: '🤖' },
    { name: 'Tool Catalog', path: '/tools', icon: '🔧' },
    { name: 'Circuit Box', path: '/admin', icon: '⚡' },
    { name: 'Deploy', path: '/deploy', icon: '🚀' },
  ];

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            if (item.isLogo) {
              return (
                <Link key={i} to="/" style={styles.logo}>
                  <span style={styles.logoText}>Nurds</span>
                  <span style={styles.logoAccent}>Code</span>
                </Link>
              );
            }
            
            return (
              <Link 
                key={i} 
                to={item.path}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {})
                }}
              >
                {item.icon && <span style={styles.navIcon}>{item.icon}</span>}
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div style={styles.navRight}>
          <button 
            style={styles.codeBtn}
            onClick={() => navigate('/code')}
          >
            ACHEEVY
          </button>
          <button style={styles.userBtn}>
            👤
          </button>
        </div>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    background: '#0F0F0F',
    borderBottom: '1px solid #1A1A1A',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: '56px'
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textDecoration: 'none',
    marginRight: '20px'
  },
  logoText: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700'
  },
  logoAccent: {
    color: '#00FF41',
    fontSize: '18px',
    fontWeight: '700'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    color: '#666',
    textDecoration: 'none',
    fontSize: '13px',
    borderRadius: '6px',
    transition: 'all 0.15s'
  },
  navItemActive: {
    background: '#1A1A1A',
    color: '#00FF41'
  },
  navIcon: {
    fontSize: '14px'
  },
  codeBtn: {
    padding: '8px 16px',
    background: '#00FF41',
    border: 'none',
    borderRadius: '6px',
    color: '#000',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  userBtn: {
    width: '36px',
    height: '36px',
    background: '#1A1A1A',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px'
  }
};
