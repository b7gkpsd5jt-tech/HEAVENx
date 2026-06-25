import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        'surface-light': '#252525',
        accent: { DEFAULT: '#FF8C00', light: '#FFA500', dark: '#CC7000', gold: '#FFD700' },
        border: '#2a2a2a',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Cinzel', 'serif'] },
      borderRadius: { xl: '1rem', '2xl': '1.5rem' },
    },
  },
  plugins: [],
};

export default config;
