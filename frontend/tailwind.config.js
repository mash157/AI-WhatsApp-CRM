module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          bg: '#ffffff',
          surface: '#fafafa',
          border: '#e4e4e7',
          text: '#18181b',
          muted: '#71717a'
        },
        primary: {
          light: '#34d399',
          DEFAULT: '#10b981',
          dark: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
