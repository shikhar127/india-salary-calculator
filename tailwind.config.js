/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        primary: '#000000',
        secondary: '#6B6B6B',
        tertiary: '#999999',
        accent: {
          green: '#00D632',
          lime: '#C8FF00',
          danger: '#FF3B30',
          'green-subtle': 'rgba(0,214,50,0.08)',
        },
        bg: {
          primary: '#FFFFFF',
          secondary: '#F5F5F5',
          tertiary: '#EBEBEB',
        },
        border: {
          default: '#E5E5E5',
        },
      },
      boxShadow: {
        elevated: '0 2px 8px rgba(0,0,0,0.08)',
        'nav': '0 -4px 20px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
