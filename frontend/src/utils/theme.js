export const DARK_THEME = {
  bg:           "#111318",
  surface:      "#1c1f26",
  surfaceHover: "#21242c",
  border:       "#2a2d35",
  sidebar:      "#161920",
  primary:      "#5b8af0",
  primaryHover: "#4a7ae0",
  primaryGlow:  "rgba(91,138,240,0.2)",
  success:      "#4ade80",
  warning:      "#fbbf24",
  danger:       "#f87171",
  textPrimary:  "#e8eaf0",
  textSecondary:"#8b92a5",
  textMuted:    "#4a4f5e",
  accent1:      "#7c6af5",
  accent2:      "#38bdf8",
  card:         "#1c1f26",
  cardBorder:   "#2a2d35",
  input:        "#13161c",
};

export const LIGHT_THEME = {
  bg:           "#f5f6fa",
  surface:      "#ffffff",
  surfaceHover: "#f0f2f8",
  border:       "#e2e5ee",
  sidebar:      "#eef0f7",
  primary:      "#4361ee",
  primaryHover: "#3451d1",
  primaryGlow:  "rgba(67,97,238,0.15)",
  success:      "#2ec4b6",
  warning:      "#f4a261",
  danger:       "#e63946",
  textPrimary:  "#1a1d2e",
  textSecondary:"#2d3258",
  textMuted:    "#6b7280",
  accent1:      "#7209b7",
  accent2:      "#4cc9f0",
  card:         "#ffffff",
  cardBorder:   "#e2e5ee",
  input:        "#f8f9fc",
};

export function getTheme(isDark) {
  return isDark ? DARK_THEME : LIGHT_THEME;
}