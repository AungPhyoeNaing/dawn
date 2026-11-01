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
        dawn: {
          dark: '#080C16',      // Deep midnight navy
          surface: '#0F172A',   // Rich navy surface card
          card: '#162035',      // Elevated navy card
          cardHover: '#1E2C48',
          border: '#233252',    // Subtle navy border
          muted: '#8E9EB8',     // Secondary slate text
          light: '#F8FAFC',
          gold: {
            DEFAULT: '#F59E0B', // Sunrise warm gold
            light: '#FCD34D',
            dark: '#D97706',
            hover: '#FBBF24',
            glow: 'rgba(245, 158, 11, 0.25)',
          },
          amber: '#F59E0B',
          rose: '#F43F5E',
          sky: '#38BDF8',
          emerald: '#10B981',
          violet: '#8B5CF6',
        }
      },
      screens: {
        'xs': '375px', // iPhone SE target breakpoint
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      boxShadow: {
        'gold-glow': '0 0 20px -3px rgba(245, 158, 11, 0.3)',
        'gold-sm': '0 0 10px -2px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
}
