/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E88E5", // blue
        secondary: "#43A047", // green
        accent: "#FDD835", // yellow
      },
    },
  },
  plugins: [],
};
