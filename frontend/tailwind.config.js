/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0015',
        surface: 'rgba(255,255,255,0.05)',
        primary: {
          DEFAULT: '#7C3AED',
          glow: '#9F67FF'
        },
        accent: {
          cyan: '#06B6D4',
          teal: '#14B8A6'
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: {
          main: '#FFFFFF',
          secondary: '#E2E8F0',
          muted: '#94A3B8',
          placeholder: '#64748B'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      animation: {
        'bounce-up': 'bounceUp 1.5s infinite',
        'bounce-down': 'bounceDown 1.5s infinite',
        'fade-slide-up': 'fadeSlideUp 0.6s ease-out forwards',
        'drift-slow': 'drift 30s infinite linear'
      },
      keyframes: {
        bounceUp: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25%)' },
        },
        bounceDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(25%)' },
        },
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        drift: {
          '0%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(50px, 30px)' },
          '66%': { transform: 'translate(-30px, 50px)' },
          '100%': { transform: 'translate(0, 0)' }
        }
      }
    },
  },
  plugins: [],
}
