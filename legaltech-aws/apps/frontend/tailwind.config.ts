import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        registry: "#0f766e",
        parchment: "#f8faf7"
      },
      boxShadow: {
        panel: "0 12px 30px rgba(20, 33, 61, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
