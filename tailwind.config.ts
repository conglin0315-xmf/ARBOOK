import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fff8ef",
        ink: "#25313f",
        leaf: "#427f60",
        skysoft: "#dff3ff",
        peach: "#ffe0c7",
        berry: "#9a4968"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(37, 49, 63, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
