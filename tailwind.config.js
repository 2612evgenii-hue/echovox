/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#09090B',
          surface: 'rgba(24, 24, 27, 0.72)',
          muted: '#A1A1AA',
        },
        accent: {
          violet: '#8B5CF6',
          gold: '#FBBF24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-white':
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
        'radial-glow':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.35), transparent)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        shimmer: 'shimmer 6s ease infinite',
      },
    },
  },
  plugins: [],
}
