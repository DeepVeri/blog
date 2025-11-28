/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-color)",
        foreground: "var(--text-color)",
        card: "var(--card-bg)",
        border: "var(--border-color)",
        primary: "var(--primary-btn)",
        "primary-foreground": "var(--primary-btn-text)",
      },
    },
  },
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
};
