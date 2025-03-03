/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
      fontFamily: {
        // sans: 'inherit', // Make the default sans-serif inherit from the parent app
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
};
