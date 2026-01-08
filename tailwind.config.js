/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A1628', // Obsidian
        surface: '#151515',
        text: '#E2E8F0',
        mute: '#9A9A9A',
        accent: '#FF6B35', // Safety Orange
        neon: '#00FF41', // Terminal Green
        cyan: '#00D4FF', // Neon Cyan
        border: '#222222',
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'ui-monospace', 'monospace'], // Enforce global terminal feel
        marker: ['"Permanent Marker"', 'cursive'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
      },
    },
  },
  plugins: [],
}
