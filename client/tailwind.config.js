module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all JSX/JS files in the src folder
    "./public/index.html"
  ],
  theme: {
    extend: {
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)'
          },
          '50%': {
            boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)'
          },
        },
      },
    },
  },
  plugins: [],
};