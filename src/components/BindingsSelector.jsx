import React from 'react';

const BINDINGS = [
  { id: 'KV', name: 'KV', icon: '🗄️', description: 'Key-Value storage', category: 'Storage' },
  { id: 'D1', name: 'D1', icon: '🗃️', description: 'SQL Database', category: 'Storage' },
  { id: 'R2', name: 'R2', icon: '📦', description: 'Object Storage', category: 'Storage' },
  { id: 'Durable Objects', name: 'Durable Objects', icon: '🔄', description: 'Stateful coordination', category: 'Storage' },
  { id: 'Workers AI', name: 'Workers AI', icon: '🤖', description: 'Run AI models', category: 'Compute' },
  { id: 'Queues', name: 'Queues', icon: '📬', description: 'Async processing', category: 'Compute' },
  { id: 'Vectorize', name: 'Vectorize', icon: '🔍', description: 'Vector database', category: 'Compute' },
  { id: 'Hyperdrive', name: 'Hyperdrive', icon: '⚡', description: 'Database acceleration', category: 'Storage' },
];

const BindingsSelector = ({ selected = [], onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleBinding = (bindingId) => {
    if (selected.includes(bindingId)) {
      onChange(selected.filter(id => id !== bindingId));
    } else {
      onChange([...selected, bindingId]);
    }
  };

  const removeBinding = (bindingId, e) => {
    e.stopPropagation();
    onChange(selected.filter(id => id !== bindingId));
  };

  return (
    <div style={styles.container}>
      <div style={styles.label}>
        CLOUDFLARE BINDINGS
        <span style={styles.count}>({selected.length})</span>
      </div>
      
      <div style={styles.selectedContainer}>
        {selected.length === 0 ? (
          <div style={styles.emptyState}>No bindings selected</div>
        ) : (
          <div style={styles.selectedList}>
            {selected.map(bindingId => {
              const binding = BINDINGS.find(b => b.id === bindingId);
              return binding ? (
                <div key={bindingId} style={styles.selectedBadge}>
                  <span style={styles.badgeIcon}>{binding.icon}</span>
                  <span style={styles.badgeName}>{binding.name}</span>
                  <button
                    style={styles.removeBtn}
                    onClick={(e) => removeBinding(bindingId, e)}
                  >
                    ×
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      <button
        style={styles.addButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={styles.addIcon}>+</span>
        Add Binding
      </button>

      {isOpen && (
        <div style={styles.menu}>
          {['Storage', 'Compute'].map(category => (
            <div key={category}>
              <div style={styles.category}>{category}</div>
              {BINDINGS.filter(b => b.category === category).map(binding => {
                const isSelected = selected.includes(binding.id);
                return (
                  <div
                    key={binding.id}
                    style={{
                      ...styles.menuItem,
                      backgroundColor: isSelected ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
                    }}
                    onClick={() => toggleBinding(binding.id)}
                  >
                    <div style={styles.menuItemTop}>
                      <span style={styles.menuIcon}>{binding.icon}</span>
                      <span style={styles.menuName}>{binding.name}</span>
                      {isSelected && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <div style={styles.description}>{binding.description}</div>
                  </div>
                );
              })}
            </div>
          ))}
          <button
            style={styles.doneButton}
            onClick={() => setIsOpen(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '16px',
    position: 'relative'
  },
  label: {
    fontSize: '10px',
    color: '#666',
    marginBottom: '6px',
    letterSpacing: '1px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  count: {
    color: 'gold',
    fontSize: '10px'
  },
  selectedContainer: {
    minHeight: '40px',
    padding: '8px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '6px',
    marginBottom: '8px'
  },
  emptyState: {
    color: '#666',
    fontSize: '12px',
    textAlign: 'center',
    padding: '8px'
  },
  selectedList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  selectedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#fff'
  },
  badgeIcon: {
    fontSize: '12px'
  },
  badgeName: {
    fontWeight: '500'
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 2px',
    marginLeft: '2px',
    '&:hover': {
      color: '#ff4444'
    }
  },
  addButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: 'gold',
      backgroundColor: '#1a1a1a'
    }
  },
  addIcon: {
    fontSize: '16px',
    fontWeight: 'bold'
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
  category: {
    padding: '8px 12px',
    fontSize: '10px',
    color: '#888',
    letterSpacing: '1px',
    fontWeight: 'bold',
    backgroundColor: '#0a0a0a',
    borderBottom: '1px solid #222'
  },
  menuItem: {
    padding: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid #222',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.05)'
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
  },
  doneButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    border: 'none',
    borderTop: '1px solid #333',
    color: 'gold',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.2)'
    }
  }
};

export default BindingsSelector;
