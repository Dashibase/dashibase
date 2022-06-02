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
        'primary-focus': '#333333',
        primary: '#454545',
        secondary: '#5B5B5B',
        tertiary: '#707070',
        backdrop: '#F5F5F5',
        surface: '#FDFDFD',
        overlay: '#FEFEFE',
        highlight: '#FFFFFF',
        'table-hover': '#F9F9F9',
        input: '#FBFBFB',
        'input-disabled': '#F1F1F1',
        'input-focus': '#FFFFFF',
        'primary-focus-dark': '#D9D9D9',
        'primary-dark': '#C8C8C8',
        'secondary-dark': '#9F9F9F',
        'tertiary-dark': '#8C8C8C',
        'backdrop-dark': '#191919',
        'surface-dark': '#1F1F1F',
        'overlay-dark': '#262626',
        'highlight-dark': '#292929',
        'table-hover-dark': '#262626',
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