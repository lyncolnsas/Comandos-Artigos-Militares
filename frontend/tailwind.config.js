/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        tactical: ['Teko', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        forest: {
          900: '#0d1f18',
          800: '#142b22',
          700: '#1e3d30',
          600: '#2d5343',
          500: '#3d6c57',
        },
        tactical: {
          gold: '#d97706',
          goldHover: '#b45309',
          orange: '#ea580c',
          dark: '#0d1117',
          panel: '#161b22',
          card: '#ffffff',
          border: '#e5e7eb',
          accent: '#15803d'
        }
      }
    },
  },
  plugins: [],
}
