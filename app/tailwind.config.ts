import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tjb-black':      '#0D0D0D',
        'tjb-surface':    '#1A1A2E',
        'tjb-blue':       '#4A90D9',
        'tjb-blue-dark':  '#1A4A8A',
        'tjb-gold':       '#C9A84C',
        'tjb-gold-light': '#F0D080',
        'tjb-white':      '#F5F5F5',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 50%, #0D1A3A 100%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(74,144,217,0.1) 0%, rgba(26,74,138,0.05) 100%)',
        'gold-gradient':
          'linear-gradient(135deg, #C9A84C 0%, #F0D080 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'slide-up':   'slideUp 0.3s ease-out',
        'fade-in':    'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(74,144,217,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(74,144,217,0.8)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config