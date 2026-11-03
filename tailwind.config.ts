import type { Config } from 'tailwindcss';

export default config: Config;

export = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'media-class',
} as any;
