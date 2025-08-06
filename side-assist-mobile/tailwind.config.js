/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          50: '#E5F3FF',
          100: '#CCE7FF',
          500: '#007AFF',
          600: '#0056CC',
          700: '#004499',
        },
        gray: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1a1a',
        },
        success: '#00ff88',
        error: '#ff6b6b',
        warning: {
          DEFAULT: '#ffd93d',
          50: '#fff9e6',
          100: '#fff3cd',
          700: '#856404',
          800: '#6b4f03',
        },
      },
      fontFamily: {
        mono: ['monospace'],
      },
      spacing: {
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
        70: '17.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
};
