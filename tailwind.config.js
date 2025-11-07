/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#0f0f11',
        coal: '#131317',
        ember: {
          50: '#fff1f1',
          100: '#ffd4d4',
          200: '#ffa9aa',
          300: '#ff7c80',
          400: '#ff4f5b',
          500: '#ff3347',
          600: '#e61d32',
          700: '#b91328',
          800: '#930f23',
          900: '#7b1023',
        },
        slate: {
          100: '#f6f7f9',
          200: '#e4e6eb',
          300: '#c9ccd6',
          400: '#a0a3af',
          500: '#717481',
          600: '#4d4f59',
          700: '#34363f',
          800: '#21232c',
          900: '#181a22',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 40px -24px rgba(255, 56, 72, 0.45)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        xl: '1.25rem',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 51, 71, 0.45)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255, 51, 71, 0)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 3s infinite',
      },
    },
  },
  plugins: [],
};
