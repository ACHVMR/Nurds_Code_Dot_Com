import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// NURD OS Palette
const PALETTE = {
  void: '#0a0a0a',
  panel: '#161616',
  slime: '#00ffcc',
  electric: '#ffaa00',
  graffiti: '#ffffff',
  danger: '#ff3366',
};

// Dot Matrix Receipt Component - Cyberpunk cash register style
export function DotMatrixReceipt({ data, title = 'DEPLOYMENT RECEIPT' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scaleY: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20, scaleY: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.5 }}
      className="font-doto bg-panel border border-slime/30 p-4 max-w-md mx-auto"
      style={{
        boxShadow: '0 0 20px rgba(0, 255, 204, 0.1)',
      }}
    >
      {/* Header */}
      <div className="text-center border-b border-dashed border-slime/30 pb-3 mb-3">
        <div className="text-slime text-lg tracking-widest">{title}</div>
        <div className="text-mute text-xs mt-1">NURDS CODE PLATFORM</div>
        <div className="text-mute text-xs">{formatDate()}</div>
      </div>

      {/* Divider */}
      <div className="text-slime/30 text-xs text-center mb-3">
        ════════════════════════════════
      </div>

      {/* Content */}
      <div className="space-y-2">
        {Object.entries(data || {}).map(([key, value], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex justify-between items-center text-xs"
          >
            <span className="text-mute uppercase">{key.replace(/_/g, ' ')}</span>
            <span className="text-graffiti">{String(value)}</span>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="text-slime/30 text-xs text-center my-3">
        ════════════════════════════════
      </div>

      {/* Footer */}
      <div className="text-center">
        <div className="text-slime text-xs">✓ TRANSACTION COMPLETE</div>
        <div className="text-mute text-xs mt-1">THANK YOU FOR BUILDING WITH US</div>
        
        {/* Barcode simulation */}
        <div className="mt-3 flex justify-center gap-px">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="bg-slime"
              style={{
                width: Math.random() > 0.5 ? '2px' : '1px',
                height: '20px',
                opacity: Math.random() * 0.5 + 0.5,
              }}
            />
          ))}
        </div>
        <div className="text-mute text-xs mt-1">TXN-{Date.now().toString(36).toUpperCase()}</div>
      </div>
    </motion.div>
  );
}

// System Diagram Component - Shows architecture
export function SystemDiagram({ nodes = [], connections = [] }) {
  const defaultNodes = [
    { id: 'client', label: 'CLIENT', x: 50, y: 20, status: 'active' },
    { id: 'edge', label: 'EDGE', x: 50, y: 40, status: 'active' },
    { id: 'worker', label: 'WORKER', x: 30, y: 60, status: 'active' },
    { id: 'ai', label: 'AI', x: 70, y: 60, status: 'active' },
    { id: 'db', label: 'D1', x: 20, y: 80, status: 'active' },
    { id: 'kv', label: 'KV', x: 50, y: 80, status: 'idle' },
    { id: 'r2', label: 'R2', x: 80, y: 80, status: 'idle' },
  ];

  const defaultConnections = [
    { from: 'client', to: 'edge' },
    { from: 'edge', to: 'worker' },
    { from: 'edge', to: 'ai' },
    { from: 'worker', to: 'db' },
    { from: 'worker', to: 'kv' },
    { from: 'ai', to: 'r2' },
  ];

  const displayNodes = nodes.length > 0 ? nodes : defaultNodes;
  const displayConnections = connections.length > 0 ? connections : defaultConnections;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return PALETTE.slime;
      case 'idle': return PALETTE.electric;
      case 'error': return PALETTE.danger;
      default: return PALETTE.mute;
    }
  };

  return (
    <div className="font-doto bg-panel border border-slime/30 p-4">
      <div className="text-slime text-sm mb-4 text-center">SYSTEM ARCHITECTURE</div>
      
      <svg viewBox="0 0 100 100" className="w-full h-64">
        {/* Connections */}
        {displayConnections.map((conn, i) => {
          const fromNode = displayNodes.find(n => n.id === conn.from);
          const toNode = displayNodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          return (
            <motion.line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={PALETTE.slime}
              strokeWidth="0.5"
              strokeOpacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          );
        })}

        {/* Nodes */}
        {displayNodes.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <rect
              x={node.x - 8}
              y={node.y - 4}
              width="16"
              height="8"
              fill={PALETTE.panel}
              stroke={getStatusColor(node.status)}
              strokeWidth="0.5"
            />
            <text
              x={node.x}
              y={node.y + 1}
              textAnchor="middle"
              fill={getStatusColor(node.status)}
              fontSize="3"
              fontFamily="monospace"
            >
              {node.label}
            </text>
            
            {/* Status indicator */}
            <circle
              cx={node.x + 6}
              cy={node.y - 2}
              r="1"
              fill={getStatusColor(node.status)}
            >
              {node.status === 'active' && (
                <animate
                  attributeName="opacity"
                  values="1;0.5;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          </motion.g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slime" />
          <span className="text-mute">ACTIVE</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-electric" />
          <span className="text-mute">IDLE</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-danger" />
          <span className="text-mute">ERROR</span>
        </div>
      </div>
    </div>
  );
}

// Code Block Component - Syntax highlighted
export function CodeBlock({ code, language = 'javascript', title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="font-doto bg-panel border border-slime/30 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-slime/20 bg-void">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-danger" />
            <div className="w-2 h-2 rounded-full bg-electric" />
            <div className="w-2 h-2 rounded-full bg-slime" />
          </div>
          {title && <span className="text-xs text-mute">{title}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-mute hover:text-slime transition-colors"
        >
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>

      {/* Code */}
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-slime">{code}</code>
      </pre>
    </div>
  );
}

// Loading Spinner - NURD style
export function NurdSpinner({ message = 'PROCESSING...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="w-16 h-16 border-2 border-slime/30 border-t-slime"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ borderRadius: '2px' }}
      />
      <motion.div
        className="font-doto text-sm text-slime mt-4"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.div>
    </div>
  );
}

// Toast Notification - NURD style
export function NurdToast({ message, type = 'success', onClose }) {
  const colors = {
    success: { bg: 'bg-slime/10', border: 'border-slime', text: 'text-slime' },
    error: { bg: 'bg-danger/10', border: 'border-danger', text: 'text-danger' },
    warning: { bg: 'bg-electric/10', border: 'border-electric', text: 'text-electric' },
    info: { bg: 'bg-graffiti/10', border: 'border-graffiti', text: 'text-graffiti' },
  };

  const style = colors[type] || colors.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`
        fixed top-4 left-1/2 z-50 
        font-doto text-sm px-6 py-3 
        ${style.bg} ${style.border} ${style.text}
        border
      `}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="hover:opacity-70">
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Main Visualizer Component - Renders different visualizations based on type
export default function Visualizer({ type, data, ...props }) {
  switch (type) {
    case 'receipt':
      return <DotMatrixReceipt data={data} {...props} />;
    case 'diagram':
      return <SystemDiagram {...data} {...props} />;
    case 'code':
      return <CodeBlock code={data?.code} language={data?.language} {...props} />;
    case 'loading':
      return <NurdSpinner message={data?.message} {...props} />;
    default:
      return (
        <div className="font-doto text-sm text-mute text-center p-4">
          Unknown visualization type: {type}
        </div>
      );
  }
}

// Export all components
export { DotMatrixReceipt, SystemDiagram, CodeBlock, NurdSpinner, NurdToast };
