/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#026775',
          light: '#018da0',
          dark: '#014d59',
        },
        accent: {
          DEFAULT: '#ff7b00',
          light: '#ff9933',
          dark: '#cc6200',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        surface: {
          DEFAULT: '#1a1a2e',
          light: '#252541',
          dark: '#0f0f1a',
        },
      },
    },
  },
  plugins: [],
};
