/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#F8FAF8',
        foreground: '#18231D',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#18231D'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#18231D'
        },
        primary: {
          DEFAULT: '#218653',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#69766E',
          foreground: '#69766E'
        },
        muted: {
          DEFAULT: '#F0F4F1',
          foreground: '#69766E'
        },
        accent: {
          DEFAULT: '#218653',
          foreground: '#FFFFFF'
        },
        destructive: {
          DEFAULT: '#C94C4C',
          foreground: '#FFFFFF'
        },
        border: '#E4EAE5',
        input: '#E4EAE5',
        ring: '#218653',
        eco: {
          light: '#218653',
          dark: '#176641',
          bg: '#F8FAF8',
          text: '#18231D',
          muted: '#69766E',
          border: '#E4EAE5',
          warning: '#C28A24',
          error: '#C94C4C'
        }
      },
      fontFamily: {
        nunito: ['NunitoSans_400Regular'],
        'nunito-medium': ['NunitoSans_500Medium'],
        'nunito-semibold': ['NunitoSans_600SemiBold'],
        'nunito-bold': ['NunitoSans_700Bold'],
      }
    },
  },
  plugins: [],
}
