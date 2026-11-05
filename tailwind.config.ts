import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { royal: { 950: "#210706", 900: "#310907", 800: "#4a100c", gold: "#d7a51d" } }, boxShadow: { soft: "0 12px 36px rgba(31, 20, 16, .07)" } } },
  plugins: []
};
export default config;
