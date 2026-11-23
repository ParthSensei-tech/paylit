import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#C8102E",
          hover: "#A50D26",
          subtle: "#FFF5F6",
          hairline: "#F0D9DD",
        },
        ink: {
          DEFAULT: "#1A0F12",
          muted: "#59494D",
          light: "#8C7B80",
          stage: "#0B0709",
          stageCard: "#140E10",
        },
        status: {
          pass: "#0F9D6E",
          passBg: "#EBF7F2",
          passBorder: "#B9E8D6",
          warning: "#D98A00",
          warningBg: "#FDF6E7",
          warningBorder: "#FCE5B5",
          violation: "#B3001B",
          violationBg: "#FDECEF",
          violationBorder: "#F9C3CB",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
