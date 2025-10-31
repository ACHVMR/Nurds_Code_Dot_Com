/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0E0E0E',
        surface: '#151515',
        text: '#EAEAEA',
        mute: '#9A9A9A',
        accent: '#C9A449',
        neon: '#39FF14',
        border: '#222222',
      },
      fontFamily: {
        sans: ['"Doto"', 'ui-sans-serif', 'system-ui'],
        marker: ['"Permanent Marker"', 'cursive'],
      },
      borderRadius: {
        DEFAULT: '0px',
      },
    },
  },
  plugins: [],
}
