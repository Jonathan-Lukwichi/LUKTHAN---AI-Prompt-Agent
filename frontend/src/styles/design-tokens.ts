/**
 * LUKTHAN Design System - Design Tokens
 *
 * This file contains all design tokens used throughout the application.
 * These values are mirrored in tailwind.config.ts for consistent styling.
 */

// ================================
// Color Palette
// ================================

export const colors = {
  // Background colors (Dark Theme)
  background: {
    primary: '#0a0a0f',      // Deepest background
    secondary: '#12121a',    // Card/panel background
    tertiary: '#1a1a24',     // Elevated surfaces
    elevated: '#22222e',     // Highest elevation
    hover: '#2a2a38',        // Hover states
  },

  // Text colors
  text: {
    primary: '#f4f4f5',      // Main text
    secondary: '#a1a1aa',    // Secondary text
    muted: '#71717a',        // Muted/disabled text
    inverse: '#0a0a0f',      // Text on light backgrounds
  },

  // Border colors
  border: {
    subtle: '#2a2a36',       // Subtle borders
    default: '#3f3f46',      // Default borders
    focus: '#52525b',        // Focus state borders
  },

  // Accent colors
  accent: {
    cyan: '#06b6d4',
    cyanLight: '#22d3ee',
    cyanDark: '#0891b2',
    purple: '#8b5cf6',
    purpleLight: '#a78bfa',
    purpleDark: '#7c3aed',
    pink: '#ec4899',
  },

  // Status colors
  status: {
    success: '#10b981',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: '#f59e0b',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    error: '#ef4444',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    info: '#3b82f6',
    infoBg: 'rgba(59, 130, 246, 0.15)',
  },

  // AI-specific colors
  ai: {
    glow: 'rgba(6, 182, 212, 0.15)',
    glowStrong: 'rgba(6, 182, 212, 0.25)',
    border: 'rgba(6, 182, 212, 0.3)',
    borderStrong: 'rgba(6, 182, 212, 0.5)',
    gradient: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    gradientReverse: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
  },
} as const;

// ================================
// Typography
// ================================

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '2rem',      // 32px
    '4xl': '2.5rem',    // 40px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

// ================================
// Spacing
// ================================

export const spacing = {
  // Base unit: 4px
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px (component padding)
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px (panel padding)
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
} as const;

// ================================
// Border Radius
// ================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',     // 4px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
  '2xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

// ================================
// Shadows
// ================================

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  xl: '0 12px 40px rgba(0, 0, 0, 0.6)',
  glow: '0 0 20px rgba(6, 182, 212, 0.15)',
  glowStrong: '0 0 30px rgba(6, 182, 212, 0.25)',
  glowAccent: '0 0 20px rgba(139, 92, 246, 0.2)',
  elevated: '0 4px 20px rgba(0, 0, 0, 0.4)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
} as const;

// ================================
// Transitions
// ================================

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: '500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// ================================
// Z-Index Scale
// ================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 100,
} as const;

// ================================
// Breakpoints
// ================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ================================
// Layout Constants
// ================================

export const layout = {
  sidebarWidth: '280px',
  sidebarCollapsedWidth: '72px',
  topBarHeight: '64px',
  contextPanelWidth: '380px',
  maxContentWidth: '1400px',
  inputMaxHeight: '200px',
} as const;

// ================================
// Animation Keyframes (for CSS-in-JS)
// ================================

export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeInUp: {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  fadeInDown: {
    from: { opacity: 0, transform: 'translateY(-10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  slideInLeft: {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  slideInRight: {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
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
    from: { width: '0' },
    to: { width: '100%' },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-4px)' },
  },
} as const;

// ================================
// Gradient Presets
// ================================

export const gradients = {
  accent: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
  accentReverse: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
  accentVertical: 'linear-gradient(180deg, #06b6d4 0%, #8b5cf6 100%)',
  subtle: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
  dark: 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)',
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  shimmer: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
} as const;

// ================================
// Glass/Blur Effects
// ================================

export const glass = {
  blur: 'blur(12px)',
  background: 'rgba(18, 18, 26, 0.8)',
  border: 'rgba(255, 255, 255, 0.08)',
} as const;

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  layout,
  keyframes,
  gradients,
  glass,
};
