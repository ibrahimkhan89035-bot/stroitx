/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0B0F19',
        },
        stroitx: {
          orange: '#F97316',
          orangeHover: '#EA580C',
          navy: '#0F172A',
          slate: '#334155',
          lightBg: '#F8FAFC',
          border: '#E2E8F0',
        },
      },
    },
  },
  plugins: [],
}
