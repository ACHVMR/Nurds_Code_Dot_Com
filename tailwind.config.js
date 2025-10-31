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
        text: '#EAEAEA',
        accent: '#C9A449',
        neon: '#39FF14',
      },
      fontFamily: {
        sans: ['"Doto"', 'sans-serif'],
        marker: ['"Permanent Marker"', 'cursive'],
      },
      borderRadius: {
        'none': '0px',
      },
    },
  },
  plugins: [],
}
