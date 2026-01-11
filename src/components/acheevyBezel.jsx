import { useState } from 'react';
import { Beaker, Flame, Hammer, Sparkles, Search, Zap } from 'lucide-react';

const MODES = [
  { id: 'lab', label: 'THE LAB', icon: Beaker, description: 'Brainstorm & clarify' },
  { id: 'nerdout', label: 'NURD OUT', icon: Flame, description: 'Deep research & specs' },
  { id: 'forge', label: 'THE FORGE', icon: Hammer, description: 'Agent execution' },
  { id: 'polish', label: 'POLISH', icon: Sparkles, description: 'Edit & refine' },
];

const CIRCUITS = [
  { id: '11labs', label: '11L', fullLabel: '11Labs Voice' },
  { id: '12labs', label: '12L', fullLabel: '12Labs Video' },
  { id: 'sam', label: 'SAM', fullLabel: 'Security Analyzer' },
  { id: 'higgsfield', label: 'HGS', fullLabel: 'Higgsfield AI' },
];

export default function AcheevyBezel({
  enabled = true,
  mode = 'lab',
  onModeChange,
  lucQuoteText = 'Tokens: -',
  onFindScout,
  activeCircuits = [],
  onCircuitToggle,
}) {
  const [localCircuits, setLocalCircuits] = useState(activeCircuits);

  const handleCircuitToggle = (circuitId) => {
    const updated = localCircuits.includes(circuitId)
      ? localCircuits.filter((c) => c !== circuitId)
      : [...localCircuits, circuitId];
    setLocalCircuits(updated);
    onCircuitToggle?.(updated);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-sm border-b border-[#222]"
      style={{ height: '56px' }}
    >
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-[#00FF41] font-bold text-lg tracking-tight">NURD</span>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-[#151515] rounded-lg p-1">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => enabled && onModeChange?.(m.id)}
                disabled={!enabled}
                title={m.description}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${isActive
                    ? 'bg-[#00F0FF] text-[#1a1a2e] shadow-lg shadow-[#00F0FF]/30'
                    : 'text-gray-400 hover:text-[#00F0FF] hover:bg-[#00F0FF]/10'
                  }
                  ${!enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Circuit Box */}
        <div className="flex items-center gap-1 bg-[#151515] rounded-lg p-1">
          {CIRCUITS.map((c) => {
            const isOn = localCircuits.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => enabled && handleCircuitToggle(c.id)}
                disabled={!enabled}
                title={c.fullLabel}
                className={`
                  px-2 py-1.5 rounded text-xs font-mono transition-all
                  ${isOn
                    ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/60 shadow-[0_0_8px_rgba(0,255,136,0.3)]'
                    : 'text-gray-500 hover:text-gray-300 border border-transparent hover:bg-white/5'
                  }
                  ${!enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Find/Scout */}
          <button
            onClick={() => enabled && onFindScout?.()}
            disabled={!enabled}
            title="Find/Scout - Research"
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
              bg-[#151515] text-gray-400 hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 border border-transparent hover:border-[#00F0FF]/30 transition-all
              ${!enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <Search size={14} />
            <span className="hidden md:inline">Find</span>
          </button>

          {/* Token Counter */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#151515] text-[#00F0FF]"
            title="Token usage"
          >
            <Zap size={14} />
            <span>{lucQuoteText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
