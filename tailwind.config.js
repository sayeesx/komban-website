/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent:   { DEFAULT: "#E10600", dark: "#9B0400" },
        komban:   { DEFAULT: "#E10600", dim: "#7a0300" },
        gold:     { DEFAULT: "#D4A84B", dim: "#8a6b2a" },
        surface:  { DEFAULT: "#0a0a0a", raised: "#111111", border: "#1f1f1f" },
      },
      fontFamily: {
        // Headings / section titles — Metal Mania via next/font CSS variable
        display: ["var(--font-display)", "cursive"],
        // Subtitles / descriptions / all body — Red Rose via next/font CSS variable
        body:    ["var(--font-body)", "serif"],
        mono:    ["ui-monospace", "monospace"],
      },
      backgroundImage: {
        "glow-red":  "radial-gradient(ellipse at 50% 0%, rgba(225,6,0,0.25) 0%, transparent 65%)",
        "glow-bot":  "radial-gradient(ellipse at 50% 100%, rgba(225,6,0,0.18) 0%, transparent 65%)",
        "vignette":  "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.9) 100%)",
      },
    },
  },
  plugins: [],
};
