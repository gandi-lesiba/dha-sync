/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dha-blue': {
          50: '#E8EEF6',
          100: '#C5D6E9',
          200: '#9EB9D9',
          300: '#779CC9',
          400: '#5080B9',
          500: '#2A64A9',
          600: '#225087',
          700: '#193C65',
          800: '#112844',
          900: '#081422',
        },
      },
    },
  },
  plugins: [],
}