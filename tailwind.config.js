const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      'logo': ['Ubuntu', ...defaultTheme.fontFamily.sans],
      'sans': ['Inter', ...defaultTheme.fontFamily.sans],
    },
    transitionProperty: {
      DEFAULT: '',
    },
    transitionDuration: {
      DEFAULT: '300ms',
    },
    extend: {
      colors: {
        neutral: {
          150: '#EDEDED',
          750: '#333333',
        },
        sidepanel: '#F5F5F5',
        'sidepanel-dark': '#141414',
        mainpanel: '#FFFFFF',
        'mainpanel-dark': '#1F1F1F',
        primary: '#454545',
        'primary-focus': '#333333',
        secondary: '#5B5B5B',
        tertiary: '#707070',
        'primary-dark': '#C8C8C8',
        'primary-focus-dark': '#D9D9D9',
        'secondary-dark': '#9F9F9F',
        'tertiary-dark': '#8C8C8C',
        // backdrop: '#FFFF00',
        // surface: '#FFA800',
        // overlay: '#00FFFF',
        // highlight: '#00FF00',
        backdrop: '#E9E9E9',
        surface: '#F5F5F5',
        overlay: '#F9F9F9',
        highlight: '#FFFFFF',
        input: '#F9F9F9',
        'input-disabled': '#F1F1F1',
        'input-focus': '#FFFFFF',
        // 'backdrop-dark': '#FFFF00',
        // 'surface-dark': '#FFA800',
        // 'overlay-dark': '#00FFFF',
        // 'highlight-dark': '#00FF00',
        'backdrop-dark': '#131313',
        'surface-dark': '#1F1F1F',
        'overlay-dark': '#262626',
        'highlight-dark': '#292929',
        'input-dark': '#1B1B1B',
        'input-disabled-dark': '#262626',
        'input-focus-dark': '#171717',
      },
      boxShadow: {
        'center': '0 3px 10px 2px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'left': '-0.8px 0px 1.7px rgba(0, 0, 0, 0.014), -2.3px 0px 4.6px rgba(0, 0, 0, 0.02), -5.4px 0px 11.2px rgba(0, 0, 0, 0.026), -18px 0px 37px rgba(0, 0, 0, 0.03)',
      },
      fontSize: {
        '2xs': ['0.625rem', '0.75rem']
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}