/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        rose: {
          50: "#FDF8F5",
          100: "#FAEAE8",
          200: "#F5D5CB",
          300: "#E8B4B8",
          400: "#D89CA0",
          500: "#C97B84",
          600: "#B5606B",
          700: "#8C3A47",
        },
        leaf: {
          50: "#F3F8EF",
          100: "#E5EFDC",
          200: "#CDE0C1",
          300: "#A8CC95",
          400: "#7BA05B",
          500: "#5E823F",
          600: "#4A6832",
        },
        cream: "#FDF8F5",
        ink: "#4A4A4A",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
