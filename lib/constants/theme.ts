/**
 * Standard Design System Color Tokens
 * Mirrors the Tailwind CSS tokens defined in app/globals.css
 * Use these for SVG charts (Recharts), canvas, or programmatic styling.
 */
export const THEME_COLORS = {
  // Brand Identity (Navy & Deep Institutional)
  brandNavy: '#0f2744',
  brandNavyDark: '#0a1b2f',
  brandNavyLight: '#1e3a5f',
  brandNavySurface: '#173860',
  brandNavyHover: '#1f487a',

  // Accent & Domain (Thai MOPH Teal)
  brandTeal: '#0f766e',
  brandTealLight: '#0d9488',

  // Semantic Status (Financial & Anomaly)
  costIncrease: '#e11d48', // rose-600
  costDecrease: '#059669', // emerald-600
  anomalyWarning: '#d97706', // amber-600
  anomalyHighlight: '#f59e0b', // amber-500

  // Neutral UI & Grids
  gridLine: '#e2e8f0', // slate-200
  axisLine: '#cbd5e1', // slate-300
  textMuted: '#64748b', // slate-500
  textMain: '#0f172a', // slate-900
} as const;

export type ThemeColors = typeof THEME_COLORS;
