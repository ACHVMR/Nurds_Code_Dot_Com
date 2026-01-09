/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NURDS CODE DARK THEME - Official Brand Colors
        background: '#0A0A0A', // Obsidian Black (consistent with Flutter)
        surface: '#111111',
        elevated: '#161616',
        text: '#FFFFFF',
        'text-secondary': '#999999',
        'text-muted': '#555555',

        // PRIMARY BRAND COLORS
        'neon-cyan': '#00E5FF',   // Cyber Cyan (primary accent)
        'neon-orange': '#FF5E00', // Alert Orange (secondary accent)
        'neon-green': '#00FF41',  // Terminal Green (success/code)

        // LEGACY SUPPORT (mapped to new colors)
        neon: '#00FF41',          // Maps to terminal green
        accent: '#00E5FF',        // Maps to cyan

        border: 'rgba(255, 255, 255, 0.1)',
        'border-focus': 'rgba(0, 229, 255, 0.3)',
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'monospace'],
        doto: ['"Doto"', 'sans-serif'],
        marker: ['"Permanent Marker"', 'cursive'],
      },
      borderRadius: {
        DEFAULT: '8px',
        none: '0px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.5)',
        'neon-orange': '0 0 20px rgba(255, 94, 0, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 65, 0.3)',
      },
    },
  },
  plugins: [],
}
