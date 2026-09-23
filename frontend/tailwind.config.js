/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govnavy: {
          50: '#f0f4f9',
          100: '#dce5f2',
          200: '#bccfe5',
          300: '#92b3d4',
          400: '#6392bf',
          500: '#4376a8',
          600: '#325d8c',
          700: '#294b72',
          800: '#1e3857',
          900: '#0f172a',
          950: '#0a101d'
        },
        govemerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
