/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#0F766E",
        accent: "#F59E0B",
        success: "#16A34A",
        warning: "#D97706",
        error: "#DC2626",
        background: "#F8FAFC",
        cards: "#FFFFFF",
        textPrimary: "#1E293B",
        textSecondary: "#64748B",
        borderCustom: "#E2E8F0",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        custom: "12px",
      }
    },
  },
  plugins: [],
}
