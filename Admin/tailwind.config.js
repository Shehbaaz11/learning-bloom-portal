/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#7D2529",
          light: "#9D3D42",
          dark: "#5D1518",
        },
        gold: {
          DEFAULT: "#D4A017",
          light: "#E8B84B",
          dark: "#B8860B",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}