/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2769f4', // Tu color azul de identidad
        secondary: '#1a1a1a',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Tu fuente actual
      }
    },
  },
  plugins: [],
}