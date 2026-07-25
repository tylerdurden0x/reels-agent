/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      height: {
        dvh: '100dvh',
      },
      animation: {
        'heart-pop': 'heart-pop 0.8s ease-out forwards',
        'fade-in': 'fade-in 0.25s ease-out forwards',
        'fade-out': 'fade-out 0.25s ease-in forwards',
      },
      keyframes: {
        'heart-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '15%': { transform: 'scale(1.2)', opacity: '1' },
          '30%': { transform: 'scale(1)', opacity: '1' },
          '80%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
