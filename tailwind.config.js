/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NURD OS Palette - Industrial meets Graffiti
        void: '#0a0a0a',      // Deep Background
        panel: '#161616',     // Card Background - Industrial Steel
        slime: '#00ffcc',     // Primary Action / Success
        electric: '#ffaa00',  // Warnings / Accents
        graffiti: '#ffffff',  // Primary Text
        danger: '#ff3366',    // Errors / Destructive
        
        // Legacy colors (for backwards compatibility)
        background: '#0a0a0a',
        surface: '#161616',
        text: '#E0E0E0',
        mute: '#888888',
        accent: '#ffaa00',
        neon: '#00ffcc',
        'neon-orange': '#FF5E00',
        border: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        // NURD OS Typography
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        doto: ['"Doto Variable"', '"Doto"', 'monospace'],      // Industrial Dot Matrix
        marker: ['"Permanent Marker"', 'cursive'],              // Graffiti style
        inter: ['"Inter"', 'ui-sans-serif', 'system-ui'],       // Clean readability
      },
      borderRadius: {
        DEFAULT: '0px',
        'circuit': '2px',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 204, 0.5), 0 0 20px rgba(0, 255, 204, 0.3)',
        'electric': '0 0 10px rgba(255, 170, 0, 0.5), 0 0 20px rgba(255, 170, 0, 0.3)',
        'panel': '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'flicker': 'flicker 0.15s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 204, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 204, 0.8), 0 0 30px rgba(0, 255, 204, 0.4)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'circuit-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffcc' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'gradient-slime': 'linear-gradient(135deg, #00ffcc 0%, #00cc99 100%)',
        'gradient-electric': 'linear-gradient(135deg, #ffaa00 0%, #ff8800 100%)',
        'gradient-hero': 'linear-gradient(135deg, #00ffcc 0%, #ffaa00 100%)',
      },
    },
  },
  plugins: [],
}
