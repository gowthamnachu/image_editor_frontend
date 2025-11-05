/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'editor-bg': '#0b0b0b',
        'editor-panel': '#101010',
        'editor-panel-light': '#1f1f1f',
        'editor-accent': '#6b6b6b',
        'editor-accent-light': '#8b8b8b',
        'editor-border': '#2a2a2a',
        'editor-highlight': '#3a3a3a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
