/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        secondary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
        },
        accent: "#f59e0b",
      },
    },
  },
  plugins: [],
};
