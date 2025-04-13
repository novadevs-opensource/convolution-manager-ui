export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Deprecated
        black: {
          DEFAULT: '#232323',
          light: '#71717A',
          ultra: '#F1F1F1',
          dark: '#1a1a1a',
        },
        */
        phantom: {
          DEFAULT: '#ab9ff2',
          light: '#cec8f0',
          dark: '#8673f3',
        },
        /* Deprecated
        purple: {
          50: '#f3eafc',
          100: '#e7d5f9',
          200: '#cfacf3',
          300: '#b783ed',
          400: '#9f5ae7',
          500: '#6E1FCE',  // Tu color base
          600: '#5819a5',
          700: '#42137c',
          800: '#2c0c53',
          900: '#16062a',
        },
        blue: {
          50: '#f0fdff',
          100: '#e1fbff',
          200: '#c3f7ff',
          300: '#a3f3ff',
          400: '#82EAFF',  // Tu color base
          500: '#68bbcc',
          600: '#4e8c99',
          700: '#345d66',
          800: '#1a2f33',
          900: '#0d1719',
        },
        green: {
          50: '#f4fff9',
          100: '#e9fff3',
          200: '#d3ffe7',
          300: '#bcffdb',
          400: '#9BFFD4',  // Tu color base
          500: '#7cccaa',
          600: '#5d997f',
          700: '#3e6655',
          800: '#1f332a',
          900: '#0f1915',
        }
        */
        yellow: {
          50: '#FFF8DB',
          100: '#FFF1B8',
          200: '#FFE98D',
          300: '#FFE264',
          400: '#FFDB47',
          500: '#FFDD33', // base
          600: '#E6C22E',
          700: '#B39823',
          800: '#806E19',
          900: '#4D440E',
        },
        beige: {
          50: '#FFF4E3',
          100: '#FFE9C7',
          200: '#FFDAA2',
          300: '#FFCB7C',
          400: '#FFC05E',
          500: '#FFD491', // base
          600: '#E6B97F',
          700: '#B38E60',
          800: '#806440',
          900: '#4D3920',
        },
        blue: {
          50: '#E7F7FD',
          100: '#CFF0FB',
          200: '#A6E4F9',
          300: '#7DD8F7',
          400: '#57C8F4', // base
          500: '#39B0DB',
          600: '#2A8CAF',
          700: '#1C6883',
          800: '#0D4457',
          900: '#001F2B',
        },
        orange: {
          50: '#FFECE4',
          100: '#FFD6C3',
          200: '#FFB28E',
          300: '#FF8F59',
          400: '#EF8354', // base
          500: '#D66F45',
          600: '#AD5838',
          700: '#85412B',
          800: '#5C2A1E',
          900: '#331311',
        },
        black: {
          DEFAULT: '#000000',
          light: '#71717A',
          ultra: '#F1F1F1',
          dark: '#1a1a1a',
          50: '#E6E6E6',
          100: '#CCCCCC',
          200: '#999999',
          300: '#666666',
          400: '#333333',
          500: '#1A1A1A',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
      },
      gradients: {
        'primary': 'linear-gradient(90deg, #6E1FCE 0%, #82EAFF 100%)',
        'secondary': 'linear-gradient(90deg, #82EAFF 0%, #9BFFD4 100%)',
      },
      /*
      'pattern-cover': "url('/src/assets/images/clouds.png') no-repeat center center / cover",
      */
      backgroundImage: {
        'clouds-pattern': "url('/src/assets/images/clouds.png')",
      },
      fontFamily: {
        "sans": ['Afacad', 'sans-serif'],
        "anek-latin": ['Anek Latin', 'sans-serif'],
      },
      animation: {
        'fadein': 'fadeIn 0.3s ease-in-out',
        'slidein': 'slideIn 0.3s ease-in-out',
        'fadeout': 'fadeOut 0.3s ease-in-out',
        'slideout': 'slideOut 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      const gradients = theme('gradients', {})
      const utilities = Object.entries(gradients).reduce((acc, [name, value]) => {
        return {
          ...acc,
          [`.bg-gradient-${name}`]: {
            backgroundImage: value,
          },
        }
      }, {})
      
      addUtilities(utilities)
    },
    function({ addBase }) {
      addBase({
         'html': { fontSize: "14px" },// If you change this, you'll need to adjust the "Chatbot" mockup
       })
     },
  ],
}