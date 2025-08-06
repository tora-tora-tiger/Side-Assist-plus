/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'figma': {
          // Status colors
          'warning': '#ffe8c8',
          'info': '#fffad0',
          'primary': '#3b82f6',     // より濃い青に変更（視認性向上）
          'primary-hover': '#2563eb', // hover状態用
          'secondary': '#e5e7eb',    // より軽やかなセカンダリ色
          'secondary-text': '#374151', // セカンダリボタンのテキスト色
          'success': '#d9ffc8',
          'danger': '#ff6363',
          'success-bright': '#5aeb5a',
          
          // UI colors
          'gray': '#e8e8e8',
          'yellow': '#fffad0',
          'orange': '#ffe8c8',
          'blue': '#6db8ff',
          'light-gray': '#b4bec8',
          'light-green': '#d9ffc8',
          'green': '#5aeb5a',
          'red': '#ff6363',
        }
      },
      dropShadow: {
        'figma': '0 4px 10px rgba(0, 0, 0, 0.25)',
        'figma-up': '0 -4px 10px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        '3xl': '24px',
      }
    }
  },
  plugins: []
}