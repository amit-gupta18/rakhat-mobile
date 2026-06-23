/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0052CC",
          50: "#E6F0FF",
          100: "#CCE0FF",
          200: "#99C2FF",
          300: "#66A3FF",
          400: "#3385FF",
          500: "#0052CC",
          600: "#0047B3",
          700: "#003D99",
          800: "#003380",
          900: "#002966",
        },
        danger: {
          DEFAULT: "#DC2626",
          subtle: "#FEF2F2",
        },
        success: {
          DEFAULT: "#16A34A",
          subtle: "#F0FDF4",
        },
      },
      borderRadius: {
        DEFAULT: "6px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
