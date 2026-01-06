import React from 'react';

const FRAMEWORKS = [
  { id: 'vanilla', name: 'Vanilla JS/TS', icon: '⚡', description: 'Pure JavaScript/TypeScript' },
  { id: 'hono', name: 'Hono', icon: '🔥', description: 'Fast web framework for Cloudflare Workers' },
  { id: 'react', name: 'React', icon: '⚛️', description: 'React with Cloudflare Pages' },
  { id: 'nextjs', name: 'Next.js', icon: '▲', description: 'Next.js on Cloudflare' },
  { id: 'astro', name: 'Astro', icon: '🚀', description: 'Astro static site generator' },
  { id: 'vue', name: 'Vue', icon: '💚', description: 'Vue.js framework' },
  { id: 'svelte', name: 'Svelte', icon: '🧡', description: 'Svelte framework' },
  { id: 'remix', name: 'Remix', icon: '💿', description: 'Remix full-stack framework' },
];

const FrameworkSelector = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedFramework = FRAMEWORKS.find(f => f.id === selected) || FRAMEWORKS[0];

  return (
    <div style={styles.container}>
      <div style={styles.label}>FRAMEWORK</div>
      <div style={styles.dropdown}>
        <button
          style={styles.button}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span style={styles.icon}>{selectedFramework.icon}</span>
          <span style={styles.name}>{selectedFramework.name}</span>
          <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
        </button>
        
        {isOpen && (
          <div style={styles.menu}>
            {FRAMEWORKS.map(framework => (
              <div
                key={framework.id}
                style={{
                  ...styles.menuItem,
                  backgroundColor: selected === framework.id ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
                }}
                onClick={() => {
                  onChange(framework.id);
                  setIsOpen(false);
                }}
              >
                <div style={styles.menuItemTop}>
                  <span style={styles.menuIcon}>{framework.icon}</span>
                  <span style={styles.menuName}>{framework.name}</span>
                  {selected === framework.id && <span style={styles.checkmark}>✓</span>}
                </div>
                <div style={styles.description}>{framework.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '16px'
  },
  label: {
    fontSize: '10px',
    color: '#666',
    marginBottom: '6px',
    letterSpacing: '1px',
    fontWeight: 'bold'
  },
  dropdown: {
    position: 'relative'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: 'gold',
      backgroundColor: '#1a1a1a'
    }
  },
  icon: {
    fontSize: '18px'
  },
  name: {
    flex: 1,
    textAlign: 'left',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500'
  },
  arrow: {
    color: '#666',
    fontSize: '10px'
  },
  menu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '6px',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
  },
  menuItem: {
    padding: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid #222',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.05)'
    },
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  menuItemTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  menuIcon: {
    fontSize: '16px'
  },
  menuName: {
    flex: 1,
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500'
  },
  checkmark: {
    color: 'gold',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  description: {
    fontSize: '11px',
    color: '#888',
    marginLeft: '24px'
  }
};

export default FrameworkSelector;
