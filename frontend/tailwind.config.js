/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // DHA style guide palette — see DESIGN.docx section 3 (UI Style Guide)
        dha: {
          blue: {
            DEFAULT: "#003366",
            50: "#e6edf5",
            100: "#cddaeb",
            200: "#9bb6d6",
            300: "#6992c2",
            400: "#3f74ab",
            500: "#1f5690",
            600: "#003366",
            700: "#002850",
            800: "#001d3a",
            900: "#001224",
          },
          "blue-light": "#e6edf5",
          steel: "#4a6d8c",
        },
        success: { DEFAULT: "#2e7d32", bg: "#e8f5e9" },
        overdue: { DEFAULT: "#c62828", bg: "#fdecea" },
        pending: { DEFAULT: "#ef6c00", bg: "#fff3e0" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};