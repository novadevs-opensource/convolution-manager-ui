export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#232323',
          light: '#71717A',
          dark: '#1a1a1a',
        },
        phantom: {
          DEFAULT: '#ab9ff2',
          light: '#cec8f0',
          dark: '#8673f3',
        },
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
      },
      gradients: {
        'primary': 'linear-gradient(90deg, #6E1FCE 0%, #82EAFF 100%)',
        'secondary': 'linear-gradient(90deg, #82EAFF 0%, #9BFFD4 100%)',
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