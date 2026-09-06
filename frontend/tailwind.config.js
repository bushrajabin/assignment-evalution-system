/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      colors: {
        ink: "#1C2541",
        paper: "#F7F5F0",
        slate: "#6B7280",
        amber: "#D9A441",
        leaf: "#3F7D58",
        rose: "#B23A48",
        rule: "#DDD8CC",
      },
    },
  },
  plugins: [],
};
