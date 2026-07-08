/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          navy: '#1e3a8a',
          dark: '#1e40af',
        },
        secondary: {
          teal: '#0d9488',
          light: '#14b8a6',
        },
        accent: {
          gold: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
