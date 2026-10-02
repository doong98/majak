/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.9', filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.8))' },
          '50%': { opacity: '0.4', filter: 'drop-shadow(0 0 2px rgba(250, 204, 21, 0.4))' },
        }
      },
      animation: {
        shake: 'shake 0.35s ease-in-out',
        pop: 'pop 0.25s ease-in-out',
        pulseGlow: 'pulseGlow 1s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
