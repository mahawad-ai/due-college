import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/emails/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1a1f36',
        coral: '#ff6b6b',
        yellow: '#ffd93d',
        green: '#6bcb77',
        'navy-light': '#2d3561',
        'coral-light': '#fff0f0',
        'yellow-light': '#fffbeb',
        'green-light': '#f0fdf4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '640px',
      },
    },
  },
  plugins: [],
};

export default config;
