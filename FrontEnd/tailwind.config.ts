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
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
        },
        secondary: '#22D3EE',
        accent: '#2DD4BF',
        dark: '#0F172A',
        grayText: '#64748B',
        border: '#E2E8F0',
        background: '#F8FAFC',
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#FF5A5F',
          light: '#FFE4E6',
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
