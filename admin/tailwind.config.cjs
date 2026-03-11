/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D97757',
          light: '#E89B7F',
          dark: '#C5613F',
        },
        bg: {
          primary: '#F9F8F6',
          secondary: '#F0EEE6',
          dark: '#111111',
        },
        text: {
          main: '#1D1C16',
          muted: '#66655F',
        },
        border: {
          subtle: '#E8E6DC',
        },
        surface: {
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Poppins', 'PingFang SC', '-apple-system', 'sans-serif'],
        body: ['Lora', 'Noto Serif SC', 'Georgia', 'serif'],
        mono: ['Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'pill': '999px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 禁用 Tailwind 的基础样式重置，避免与 Ant Design 冲突
  },
}
