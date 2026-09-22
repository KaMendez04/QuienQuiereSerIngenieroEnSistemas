/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mq: {
          bg: "#02041c",
          panel: "#050a33",
          panel2: "#0a1147",
          line: "#1b2a7a",
          gold: "#ffb400",
          goldlight: "#ffd75e",
          golddim: "#7a5a10",
        },
      },
      fontFamily: {
        display: ["Inter", "Segoe UI", "Verdana", "sans-serif"],
      },
      clip: {
        hexagon: "polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%)",
      },
      boxShadow: {
        "gold-glow": "0 0 18px rgba(255,180,0,0.55)",
        "gold-inner": "inset 0 0 14px rgba(255,180,0,0.25)",
      },
    },
  },
  plugins: [],
};
