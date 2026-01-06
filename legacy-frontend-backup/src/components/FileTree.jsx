import React, { useState } from 'react';

const FileTree = ({ files, activeFile, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));

  // Build tree structure from flat file list
  const buildTree = (files) => {
    const tree = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          current[part] = { type: 'file', path: file.path, content: file.content };
        } else {
          // It's a folder
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} };
          }
          current = current[part].children;
        }
      });
    });
    
    return tree;
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  const renderTree = (node, path = '', level = 0) => {
    return Object.keys(node).map(key => {
      const item = node[key];
      const fullPath = path ? `${path}/${key}` : key;
      const isExpanded = expandedFolders.has(fullPath);
      
      if (item.type === 'folder') {
        return (
          <div key={fullPath}>
            <div
              style={{
                ...styles.treeItem,
                paddingLeft: `${level * 16 + 8}px`,
                cursor: 'pointer'
              }}
              onClick={() => toggleFolder(fullPath)}
            >
              <span style={styles.icon}>{isExpanded ? '📂' : '📁'}</span>
              <span style={styles.folderName}>{key}</span>
            </div>
            {isExpanded && item.children && (
              <div>
                {renderTree(item.children, fullPath, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        // File
        const isActive = activeFile === item.path;
        return (
          <div
            key={fullPath}
            style={{
              ...styles.treeItem,
              ...styles.fileItem,
              paddingLeft: `${level * 16 + 8}px`,
              backgroundColor: isActive ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
              borderLeft: isActive ? '2px solid gold' : '2px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => onFileSelect(item.path)}
          >
            <span style={styles.icon}>{getFileIcon(key)}</span>
            <span style={styles.fileName}>{key}</span>
          </div>
        );
      }
    });
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return '📄';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return '📘';
    if (filename.endsWith('.css')) return '🎨';
    if (filename.endsWith('.json')) return '📋';
    if (filename.endsWith('.md')) return '📝';
    if (filename.endsWith('.toml')) return '⚙️';
    if (filename.endsWith('.html')) return '🌐';
    return '📄';
  };

  const tree = buildTree(files);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>📁 PROJECT FILES</span>
        <span style={styles.fileCount}>{files.length} files</span>
      </div>
      <div style={styles.tree}>
        {renderTree(tree)}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
    borderRight: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'monospace',
    fontSize: '13px'
  },
  header: {
    padding: '12px',
    backgroundColor: '#111',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    color: 'gold',
    fontWeight: 'bold',
    fontSize: '11px',
    letterSpacing: '1px'
  },
  fileCount: {
    color: '#666',
    fontSize: '10px'
  },
  tree: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 0'
  },
  treeItem: {
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s',
    userSelect: 'none'
  },
  fileItem: {
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.05)'
    }
  },
  icon: {
    marginRight: '6px',
    fontSize: '14px'
  },
  folderName: {
    color: '#ccc',
    fontWeight: '500'
  },
  fileName: {
    color: '#aaa'
  }
};

export default FileTree;
