/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          light: '#4DA3FF',
          dark: '#0055CC',
        },
      },
      animation: {
        'message-appear': 'message-appear 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
