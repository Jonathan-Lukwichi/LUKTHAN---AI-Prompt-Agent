/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00E5FF',
        'neon-purple': '#9B5CFF',
        'neon-pink': '#FF6B9D',
        'bg-deep': '#050816',
        'bg-card': '#0A0F1F',
        'bg-elevated': '#0F1629',
        'text-primary': '#F0F6FC',
        'text-secondary': '#8B949E',
        'text-muted': '#6E7681',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '24px',
        '2xl': '32px',
      },
      boxShadow: {
        'glow': '0 0 25px rgba(155, 92, 255, 0.3), 0 0 50px rgba(0, 229, 255, 0.1)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.4)',
        'glow-purple': '0 0 20px rgba(155, 92, 255, 0.4)',
        'glow-pink': '0 0 20px rgba(255, 107, 157, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00E5FF 0%, #9B5CFF 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(10, 15, 31, 0.95) 0%, rgba(15, 20, 40, 0.95) 100%)',
      },
    },
  },
  plugins: [],
}
