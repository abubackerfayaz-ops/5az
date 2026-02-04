/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505', // Slightly off-black
        surface: '#121212',
        foreground: '#ffffff',

        // Luxury Futurism Palette
        'neon-lime': '#D9FF00',
        'neon-pink': '#FF0080',
        'neon-blue': '#0066FF',
        'neon-cyan': '#00FFFF',
        'chrome-white': '#E6E6E6',
        'deep-void': '#020202',
        'cyber-purple': '#BD00FF',
        'holographic-blue': '#00F0FF',

        // Semantic mappings
        'accent-primary': '#D9FF00',
        'accent-secondary': '#E6E6E6',
      },
      fontFamily: {
        sans: ['var(--font-fancy)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        fancy: ['var(--font-fancy)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        aesthetic: ['var(--font-aesthetic)', 'sans-serif'],
        modern: ['var(--font-sans-alt)', 'sans-serif'],
        accent: ['var(--font-accent)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'liquid-chrome': 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #a0a0a0 100%)',
        'holographic': 'linear-gradient(45deg, #BD00FF, #00F0FF, #D9FF00)',
      },
      animation: {
        'gradient-xy': 'gradient-xy 6s ease infinite',
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': '0% 0%'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': '100% 100%'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
