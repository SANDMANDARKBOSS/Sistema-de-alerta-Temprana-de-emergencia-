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
        primary: {
          DEFAULT: '#1565C0',
          light: '#E3F2FD',
        },
        success: {
          DEFAULT: '#4CAF50',
          light: '#E8F5E9',
        },
        warning: {
          DEFAULT: '#FFC107',
          light: '#FFF8E1',
        },
        danger: {
          DEFAULT: '#F44336',
          light: '#FFEBEE',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)'],
        inter: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
};
export default config;
