/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Fraunces = warm editorial serif for headings & big numbers (farm provenance feel)
        // Jakarta  = clean humanist sans for all UI/body text
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Brand green (primary)
        field: {
          DEFAULT: '#1E7A45',
          50: '#EDF6F0',
          100: '#D7E8D6',
          200: '#B7D9BE',
          300: '#8FC49E',
          400: '#4FA96E',
          500: '#2A9159',
          600: '#1E7A45',
          700: '#175E36',
          800: '#12492C',
          900: '#0C3320',
        },
        // Turmeric (secondary accent — use sparingly)
        turmeric: {
          DEFAULT: '#EBA417',
          light: '#F4B02C',
          deep: '#C6820B',
          ink: '#3D2C05',
        },
        soil: '#A2572E',
        ink: {
          DEFAULT: '#16271D',
          soft: '#2C3A31',
        },
        muted: {
          DEFAULT: '#5E6B60',
          soft: '#828E82',
        },
        paper: '#F6F4EC',
        card: '#FBFAF5',
        sprout: {
          DEFAULT: '#E8F1E7',
          deep: '#D7E8D6',
        },
        line: {
          DEFAULT: '#E5E1D4',
          soft: '#EFEBDF',
        },
        danger: {
          DEFAULT: '#C0492F',
          bg: '#FBEDE9',
        },
        // Per-category accents
        cat: {
          veg: '#2F7A34',
          fruit: '#C1651B',
          grain: '#A67C12',
          pulse: '#8A6D3B',
          herb: '#1E8A6B',
          spice: '#B4472E',
          other: '#5E6B60',
        },
      },
      borderRadius: {
        sm: '10px',
        DEFAULT: '16px',
        lg: '22px',
        xl: '28px',
        '2xl': '34px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(22,39,29,.06), 0 1px 3px rgba(22,39,29,.05)',
        DEFAULT: '0 6px 20px rgba(22,39,29,.08)',
        md: '0 8px 24px rgba(22,39,29,.10)',
        lg: '0 18px 44px rgba(18,73,44,.14)',
        card: '0 2px 10px rgba(22,39,29,.05)',
      },
      maxWidth: {
        wrap: '1240px',
      },
      keyframes: {
        bob: {
          '0%,100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-14px) rotate(3deg)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        bob: 'bob 5s ease-in-out infinite',
        'fade-up': 'fade-up .4s ease both',
        'scale-in': 'scale-in .18s ease both',
        'slide-up': 'slide-up .28s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
};
