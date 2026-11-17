import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panther: { red: '#E4202B', amber: '#F5A300' },
        ink: '#14151A',
        charcoal: '#1F2127',
        steel: '#6B7079',
        fog: '#F2F3F4',
        line: '#E3E5E8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: { page: '1440px' },
    },
  },
  plugins: [],
};
export default config;
