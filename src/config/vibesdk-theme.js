/**
 * ============================================
 * VibeSDK Tailwind Theme Extension
 * ============================================
 * 
 * Extends Tailwind CSS with Nurds Dark theme colors
 * and custom utilities for the whitelabeled VibeSDK.
 * 
 * Import in tailwind.config.js:
 *   const vibeTheme = require('./src/config/vibesdk-theme');
 *   module.exports = { ...vibeTheme.tailwindExtend };
 */

/**
 * Nurds Dark color palette
 */
const colors = {
  // Primary - Cyan accent
  primary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#00d9ff', // Main brand color
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  
  // Secondary - Deep purple
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed', // Accent purple
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  
  // Background - Dark canvas
  canvas: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f1419', // Main background
    950: '#0a0e14', // Deep background
  },
  
  // Surface - Card backgrounds
  surface: {
    DEFAULT: '#1a1f2e',
    light: '#242b3d',
    dark: '#12161f',
    border: '#2a3144',
  },
  
  // Mode colors
  mode: {
    lab: '#00d9ff',      // Cyan - exploration
    nerdout: '#a855f7',  // Purple - deep work
    forge: '#22c55e',    // Green - building
    polish: '#f59e0b',   // Amber - refinement
  },
  
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

/**
 * Tailwind theme extension
 */
const tailwindExtend = {
  theme: {
    extend: {
      colors,
      
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      
      spacing: {
        'bezel': '60px', // Height of ACHEEVY Bezel
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-secondary': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(0, 217, 255, 0.1)',
      },
      
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 217, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      zIndex: {
        'bezel': 1000,
        'modal': 1100,
        'toast': 1200,
      },
    },
  },
};

/**
 * CSS custom properties for runtime theming
 */
const cssVariables = `
  :root {
    /* Colors */
    --vibe-primary: #00d9ff;
    --vibe-secondary: #7c3aed;
    --vibe-background: #0f1419;
    --vibe-surface: #1a1f2e;
    --vibe-surface-light: #242b3d;
    --vibe-border: #2a3144;
    --vibe-text: #f8fafc;
    --vibe-text-muted: #94a3b8;
    
    /* Mode colors */
    --vibe-mode-lab: #00d9ff;
    --vibe-mode-nerdout: #a855f7;
    --vibe-mode-forge: #22c55e;
    --vibe-mode-polish: #f59e0b;
    
    /* Semantic */
    --vibe-success: #22c55e;
    --vibe-warning: #f59e0b;
    --vibe-error: #ef4444;
    --vibe-info: #3b82f6;
    
    /* Spacing */
    --vibe-bezel-height: 60px;
    --vibe-radius: 0.5rem;
    --vibe-radius-lg: 1rem;
    
    /* Typography */
    --vibe-font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
    --vibe-font-mono: 'JetBrains Mono', ui-monospace, monospace;
    
    /* Effects */
    --vibe-blur: 10px;
    --vibe-transition: 200ms ease;
  }
`;

/**
 * Additional CSS utilities for VibeSDK
 */
const utilities = `
  /* Glass morphism effect */
  .vibe-glass {
    background: rgba(26, 31, 46, 0.8);
    backdrop-filter: blur(var(--vibe-blur));
    border: 1px solid var(--vibe-border);
  }
  
  /* Glow effects */
  .vibe-glow {
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
  }
  
  .vibe-glow-secondary {
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
  }
  
  /* Mode indicator pills */
  .vibe-mode-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .vibe-mode-indicator.lab {
    background: rgba(0, 217, 255, 0.2);
    color: var(--vibe-mode-lab);
    border: 1px solid var(--vibe-mode-lab);
  }
  
  .vibe-mode-indicator.nerdout {
    background: rgba(168, 85, 247, 0.2);
    color: var(--vibe-mode-nerdout);
    border: 1px solid var(--vibe-mode-nerdout);
  }
  
  .vibe-mode-indicator.forge {
    background: rgba(34, 197, 94, 0.2);
    color: var(--vibe-mode-forge);
    border: 1px solid var(--vibe-mode-forge);
  }
  
  .vibe-mode-indicator.polish {
    background: rgba(245, 158, 11, 0.2);
    color: var(--vibe-mode-polish);
    border: 1px solid var(--vibe-mode-polish);
  }
  
  /* Code blocks */
  .vibe-code {
    background: var(--vibe-surface);
    border: 1px solid var(--vibe-border);
    border-radius: var(--vibe-radius);
    font-family: var(--vibe-font-mono);
    font-size: 0.875rem;
    padding: 1rem;
    overflow-x: auto;
  }
  
  /* Bezel safe area */
  .vibe-content-with-bezel {
    padding-bottom: calc(var(--vibe-bezel-height) + 1rem);
  }
  
  /* Scrollbar styling */
  .vibe-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .vibe-scrollbar::-webkit-scrollbar-track {
    background: var(--vibe-surface);
    border-radius: 4px;
  }
  
  .vibe-scrollbar::-webkit-scrollbar-thumb {
    background: var(--vibe-border);
    border-radius: 4px;
  }
  
  .vibe-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--vibe-text-muted);
  }
`;

/**
 * Generate complete CSS for VibeSDK theme
 */
function generateThemeCSS() {
  return `${cssVariables}\n${utilities}`;
}

module.exports = {
  colors,
  tailwindExtend,
  cssVariables,
  utilities,
  generateThemeCSS,
};

// ESM export for React
export { colors, tailwindExtend, cssVariables, utilities, generateThemeCSS };
export default { colors, tailwindExtend, cssVariables, utilities, generateThemeCSS };
