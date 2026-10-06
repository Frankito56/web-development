/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dbe4fe',
          200: '#bfd0fe',
          300: '#93b1fd',
          400: '#6088fa',
          500: '#3b62f6',
          600: '#2544eb',
          700: '#1d32d8',
          800: '#1e2bb0',
          900: '#1e298a',
          950: '#171a54',
        },
        academic: {
          navy: '#0f172a',
          gold: '#d97706',
          emerald: '#059669',
          crimson: '#dc2626',
          slate: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'book': '0 8px 24px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
        'book-hover': '0 20px 30px -6px rgba(15, 23, 42, 0.2), 0 8px 16px -4px rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
}
