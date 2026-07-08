/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-navy': '#1e3a8a',
        'secondary-teal': '#0d9488',
        'accent-gold': '#f59e0b',
        'light-blue': '#e0f2fe',
      },
      fontFamily: {
        'primary': ['Inter', 'sans-serif'],
        'secondary': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
