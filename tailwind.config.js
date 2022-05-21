module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
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
      },
      boxShadow: {
        'center': '0 3px 10px 2px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'left': '-0.8px 0px 1.7px rgba(0, 0, 0, 0.014), -2.3px 0px 4.6px rgba(0, 0, 0, 0.02), -5.4px 0px 11.2px rgba(0, 0, 0, 0.026), -18px 0px 37px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}