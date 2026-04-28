export const DARK_THEME = {
  bg:           "#0a0a0f",
  surface:      "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border:       "rgba(255,255,255,0.08)",
  sidebar:      "rgba(10,10,20,0.85)",
  primary:      "#5b8af0",
  primaryHover: "#4a7ae0",
  primaryGlow:  "rgba(91,138,240,0.15)",
  success:      "#4ade80",
  warning:      "#fbbf24",
  danger:       "#f87171",
  textPrimary:  "#f0f2ff",
  textSecondary:"#9aa3c2",
  textMuted:    "#4a5070",
  accent1:      "#a78bfa",
  accent2:      "#38bdf8",
  card:         "rgba(255,255,255,0.04)",
  cardBorder:   "rgba(255,255,255,0.08)",
  input:        "rgba(255,255,255,0.05)",
  glass:        "rgba(255,255,255,0.04)",
  glassBorder:  "rgba(255,255,255,0.1)",
  glassBlur:    "blur(20px)",
  glassHighlight: "rgba(255,255,255,0.08)",
};

export const LIGHT_THEME = {
  bg:           "#eef0f7",
  surface:      "rgba(255,255,255,0.7)",
  surfaceHover: "rgba(255,255,255,0.85)",
  border:       "rgba(0,0,0,0.07)",
  sidebar:      "rgba(238,240,247,0.85)",
  primary:      "#4361ee",
  primaryHover: "#3451d1",
  primaryGlow:  "rgba(67,97,238,0.15)",
  success:      "#2ec4b6",
  warning:      "#f4a261",
  danger:       "#e63946",
  textPrimary:  "#1a1d2e",
  textSecondary:"#5c6380",
  textMuted:    "#9ba3be",
  accent1:      "#7209b7",
  accent2:      "#4cc9f0",
  card:         "rgba(255,255,255,0.7)",
  cardBorder:   "rgba(255,255,255,0.9)",
  input:        "rgba(255,255,255,0.6)",
  glass:        "rgba(255,255,255,0.55)",
  glassBorder:  "rgba(255,255,255,0.8)",
  glassBlur:    "blur(20px)",
  glassHighlight: "rgba(255,255,255,0.9)",
};

export function getTheme(isDark) {
  return isDark ? DARK_THEME : LIGHT_THEME;
}

export function glassCard(theme, isDark, extra = {}) {
  return {
    background: theme.glass,
    backdropFilter: theme.glassBlur,
    WebkitBackdropFilter: theme.glassBlur,
    border: `1px solid ${theme.glassBorder}`,
    borderRadius: "20px",
    position: "relative",
    overflow: "hidden",
    boxShadow: isDark
      ? "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
      : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
    ...extra,
  };
}