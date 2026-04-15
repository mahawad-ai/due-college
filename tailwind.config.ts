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
        // New Apple-inspired palette
        ink: '#1d1d1f',
        coral: '#ff3b30',
        'coral-light': 'rgba(255,59,48,0.08)',
        'gray-1': '#424245',
        'gray-2': '#6e6e73',
        'gray-3': '#86868b',
        'gray-4': '#aeaeb2',
        'gray-5': '#d2d2d7',
        'gray-6': '#e8e8ed',
        'gray-7': '#f5f5f7',
        // Legacy (kept for backward compat)
        navy: '#1d1d1f',
        'navy-light': '#424245',
        yellow: '#ff9f0a',
        green: '#34c759',
        'yellow-light': 'rgba(255,159,10,0.1)',
        'green-light': 'rgba(52,199,89,0.1)',
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
