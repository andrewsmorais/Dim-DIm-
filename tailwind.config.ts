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
        background: {
          DEFAULT: "#F5F5F5",
          dark: "#0A0A0A",
          card: "#FFFFFF",
          cardDark: "#1A1A1A",
        },
        primary: {
          DEFAULT: "#00FF88",
          dark: "#00CC6A",
        },
        text: {
          DEFAULT: "#000000",
          light: "#FFFFFF",
          secondary: "#666666",
          secondaryDark: "#A0A0A0",
        },
        brand: {
          dark: '#0D4722',
          accent: '#00C853',
          bg: '#F0F2F5',
          card: '#FFFFFF',
          textMuted: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
