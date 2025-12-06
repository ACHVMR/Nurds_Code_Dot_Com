/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505', // Matte Black from index.css
        surface: '#0E0E0E',
        text: '#E0E0E0',
        mute: '#888888',
        accent: '#FFC000', // Honey Gold
        neon: '#00FF88', // Newon Green
        'neon-orange': '#FF5E00',
        border: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        doto: ['"Doto"', 'sans-serif'],
        marker: ['"Permanent Marker"', 'cursive'],
      },
      borderRadius: {
        DEFAULT: '0px',
      },
    },
  },
  plugins: [],
}
