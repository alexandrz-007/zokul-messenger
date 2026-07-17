/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F7CF6',
          light: '#5B9AF8',
          dark: '#2563EB',
        },
        surface: {
          DEFAULT: '#0B111C',
          sidebar: '#0E1726',
          header: '#111C2D',
          elevated: '#162235',
          incoming: '#1B2738',
        },
      },
      animation: {
        'message-appear': 'message-appear 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
