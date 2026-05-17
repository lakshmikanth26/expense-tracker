import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#111111',
          elevated: '#1a1a1a',
          card: '#141414',
        },
        border: {
          subtle: '#1f1f1f',
          DEFAULT: '#2a2a2a',
          strong: '#383838',
        },
        income: '#22c55e',
        expense: '#ef4444',
        invest: '#a855f7',
        saving: '#3b82f6',
        loan: '#f97316',
        neutral: '#6b7280',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
