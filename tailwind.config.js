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
          dark: '#101a29',      // Deep midnight liquid base
          surface: '#172437',   // Rich navy surface
          card: '#1c2d42',      // Elevated glass card
          cardHover: '#182542',
          border: 'rgba(255, 255, 255, 0.08)', // Subtle liquid glass border
          muted: '#a9b7c9',     // Secondary slate text
          light: '#F8FAFC',
          gold: {
            DEFAULT: '#e9be78', // Sunrise warm gold
            light: '#FDE68A',
            dark: '#D97706',
            hover: '#FBBF24',
            glow: 'rgba(245, 158, 11, 0.35)',
          },
          amber: '#e9be78',
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
        sans: ['Trebuchet MS', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
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
        'gold-glow': '0 0 25px -2px rgba(245, 158, 11, 0.35)',
        'gold-sm': '0 0 12px -1px rgba(245, 158, 11, 0.3)',
        'glass-card': '0 10px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'liquid-slow': 'liquidFloat1 18s ease-in-out infinite alternate',
        'liquid-pulse': 'liquidPulse 8s ease-in-out infinite',
      },
      keyframes: {
        liquidFloat1: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.1)' },
          '100%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        liquidPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
