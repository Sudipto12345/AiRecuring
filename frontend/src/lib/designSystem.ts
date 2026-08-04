/**
 * AIRecruit $5k-Designer Open-Source UI/UX Design System Guidelines
 *
 * 1. Color Palette:
 *    - Canvas: #030712 (Executive Midnight Slate)
 *    - Surface 1: #0b0f19 (Glassmorphic Backdrop Blur)
 *    - Surface 2: #111827 (Card Elevation)
 *    - Brand Gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)
 *    - Success: #10b981 (Emerald Glow)
 *    - Warning: #f59e0b (Amber Radiant)
 *    - Danger: #f43f5e (Electric Rose)
 *    - Info: #06b6d4 (Vivid Sky)
 *
 * 2. Component Guidelines:
 *    - Rounded Corners: rounded-2xl (1.25rem) for cards, rounded-xl (0.75rem) for buttons/inputs
 *    - Borders: Subtle 1px translucent borders (border-indigo-500/15 or border-white/10)
 *    - Shadows: High-depth glow shadows (shadow-lg shadow-indigo-950/20)
 *    - Micro-Interactions: hover:-translate-y-0.5 hover:shadow-indigo-500/10 transition-all duration-200
 */

export const DESIGN_TOKENS = {
  colors: {
    brand: {
      from: "#6366f1",
      via: "#8b5cf6",
      to: "#a855f7",
      glow: "rgba(99, 102, 241, 0.15)",
    },
    canvas: "#030712",
    surface: "#0b0f19",
    surfaceElevated: "#111827",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#f43f5e",
    info: "#06b6d4",
  },
  typography: {
    title: "font-bold tracking-tight text-white",
    subtitle: "text-xs font-medium text-slate-400 sm:text-sm",
    body: "text-xs leading-relaxed text-slate-300",
  },
  cardStyle:
    "rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90 p-5 backdrop-blur-xl shadow-lg shadow-indigo-950/20 transition-all hover:border-indigo-500/35 hover:-translate-y-0.5",
};
