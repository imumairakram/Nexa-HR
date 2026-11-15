/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appBg: '#F4F4EC',
        pastelGreen: {
          light: '#E6F4EA',
          DEFAULT: '#D1FAE5',
          dark: '#1E8E3E',
        },
        pastelOrange: {
          light: '#FEF3D6',
          DEFAULT: '#FFEDD5',
          dark: '#E37400',
        },
        pastelPurple: {
          light: '#F3E8FF',
          DEFAULT: '#EDE9FE',
          dark: '#7E22CE',
        },
        sky: {
          50: '#F0F9FC',
          100: '#E1F4FA',
          200: '#BAE6F5',
          300: '#7CD1EB',
          400: '#3CC1E6',
          500: '#0A8FB5',
          600: '#087A9B',
          700: '#07617D',
          800: '#094F66',
          900: '#0C4356',
          950: '#052B38',
        },
        pastelBlue: {
          light: '#E1F4FA',
          DEFAULT: '#BAE6F5',
          dark: '#07617D',
        },
      },
      borderRadius: {
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'soft-hover': '0 12px 35px rgba(0, 0, 0, 0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
