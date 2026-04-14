// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-sans)', 'DM Sans', 'sans-serif'],
        serif:   ['var(--font-serif)', 'Playfair Display', 'serif'],
        display: ['var(--font-display)', 'Bebas Neue', 'cursive'],
      },
      colors: {
        navy:    { DEFAULT: '#0D0E2C', 2: '#16173D', 3: '#1E1F52' },
        purple:  { DEFAULT: '#2E1B8C', 2: '#4A2DB0' },
        gold:    { DEFAULT: '#F5C842', 2: '#E8A915', 3: '#FFD966' },
        iris:    { DEFAULT: '#7B6FD4', 2: '#9B91E0', 3: '#C4BEEC' },
        muted:   '#8B88B8',
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        'dot-pulse': 'dot-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: '-200% center' },
          to:   { backgroundPosition:  '200% center' },
        },
        'dot-pulse': {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1' },
          '50%':       { transform: 'scale(1.5)', opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

export default config
