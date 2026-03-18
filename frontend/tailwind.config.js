/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edfaf4',
          100: '#d1f2e3',
          200: '#a3e5c7',
          300: '#75d8ab',
          400: '#54bd95',
          500: '#3da67e',
          600: '#2f8565',
          700: '#276b52',
          800: '#225542',
          900: '#1e4637',
        },
        // Neumorphism-friendly gray palette
        neu: {
          light: '#e0e0e0',
          'light-shadow': '#bebebe',
          'light-highlight': '#ffffff',
          dark: '#2d2d2d',
          'dark-shadow': '#1a1a1a',
          'dark-highlight': '#404040',
        }
      },
      boxShadow: {
        'neu-raised': '8px 8px 16px #bebebe, -8px -8px 16px #ffffff',
        'neu-raised-sm': '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
        'neu-raised-lg': '12px 12px 24px #bebebe, -12px -12px 24px #ffffff',
        'neu-inset': 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
        'neu-inset-sm': 'inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff',
        'neu-raised-dark': '8px 8px 16px #1a1a1a, -8px -8px 16px #404040',
        'neu-raised-dark-sm': '4px 4px 8px #1a1a1a, -4px -4px 8px #404040',
        'neu-raised-dark-lg': '12px 12px 24px #1a1a1a, -12px -12px 24px #404040',
        'neu-inset-dark': 'inset 6px 6px 12px #1a1a1a, inset -6px -6px 12px #404040',
        'neu-inset-dark-sm': 'inset 3px 3px 6px #1a1a1a, inset -3px -3px 6px #404040',
      },
      borderRadius: {
        'neu': '16px',
        'neu-lg': '24px',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
