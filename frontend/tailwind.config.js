/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background colors (Dark Theme)
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a24',
          elevated: '#22222e',
          hover: '#2a2a38',
        },
        // Text colors
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#71717a',
          inverse: '#0a0a0f',
        },
        // Border colors
        border: {
          subtle: '#2a2a36',
          DEFAULT: '#3f3f46',
          focus: '#52525b',
          hover: '#4a4a56',
        },
        // Accent colors
        accent: {
          cyan: '#06b6d4',
          'cyan-light': '#22d3ee',
          'cyan-dark': '#0891b2',
          purple: '#8b5cf6',
          'purple-light': '#a78bfa',
          'purple-dark': '#7c3aed',
          pink: '#ec4899',
          DEFAULT: '#6366F1',
          glow: '#818CF8',
          subtle: 'rgba(99, 102, 241, 0.15)',
          muted: 'rgba(99, 102, 241, 0.08)',
        },
        // Status colors
        success: {
          DEFAULT: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
        },
        error: {
          DEFAULT: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
        },
        info: {
          DEFAULT: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.15)',
        },
        // AI-specific colors
        ai: {
          glow: 'rgba(6, 182, 212, 0.15)',
          'glow-strong': 'rgba(6, 182, 212, 0.25)',
          border: 'rgba(6, 182, 212, 0.3)',
          'border-strong': 'rgba(6, 182, 212, 0.5)',
        },
        // Legacy support
        'neon-cyan': '#06b6d4',
        'neon-purple': '#8b5cf6',
        'neon-pink': '#ec4899',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '68': '17rem',
        '72': '18rem',
        '84': '21rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'xl': '0 12px 40px rgba(0, 0, 0, 0.6)',
        'glow': '0 0 20px rgba(6, 182, 212, 0.15)',
        'glow-strong': '0 0 30px rgba(6, 182, 212, 0.25)',
        'glow-accent': '0 0 20px rgba(139, 92, 246, 0.2)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'elevated': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'inner-subtle': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-in-up': 'fadeInUp 300ms ease-out',
        'fade-in-down': 'fadeInDown 300ms ease-out',
        'slide-in-left': 'slideInLeft 250ms ease-out',
        'slide-in-right': 'slideInRight 250ms ease-out',
        'slide-in': 'slideIn 250ms ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'typewriter': 'typewriter 0.5s steps(20) forwards',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'thinking-dot': 'thinkingDot 1.4s ease-in-out infinite',
        'scale-in': 'scaleIn 200ms ease-out',
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        thinkingDot: {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
        'gradient-accent-reverse': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        'gradient-accent-vertical': 'linear-gradient(180deg, #06b6d4 0%, #8b5cf6 100%)',
        'gradient-subtle': 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'gradient-dark': 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
        'grid-pattern': 'linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
        'shimmer': '200% 100%',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      zIndex: {
        'dropdown': '10',
        'sticky': '20',
        'fixed': '30',
        'modal-backdrop': '40',
        'modal': '50',
        'popover': '60',
        'tooltip': '70',
        'toast': '80',
        'max': '100',
      },
    },
  },
  plugins: [],
}
