import { createTheme } from "@mui/material/styles";
import type { Direction } from "./i18n/translations";
import type { ColorThemeMode } from "./themeStore";

const fontStacks = {
  ltr: "'Inter', sans-serif",
  rtl: "'Vazirmatn', sans-serif",
} as const;

// Surface and text colors per mode. Keep the dark values in sync with
// :root[data-color-theme="dark"] in theme.css.
const modeColors = {
  light: { paper: "#ffffff", text: "#20304A", textSecondary: "#5B6B82", secondaryContrast: "#17243A" },
  dark: { paper: "#172131", text: "#E6EDF7", textSecondary: "#9AA8BD", secondaryContrast: "#ffffff" },
} as const;

export function createSimorqTheme(
  direction: Direction,
  colors: readonly string[] = ["#356AE6", "#20AFA3", "#FFC857", "#FF7A70"],
  mode: ColorThemeMode = "light",
) {
  const [primary, secondary] = colors;
  const surface = modeColors[mode];
  return createTheme({
    direction,
    palette: {
      mode,
      primary: {
        main: primary,
        dark: primary,
        contrastText: "#ffffff",
      },
      secondary: {
        main: secondary,
        light: `${secondary}33`,
        contrastText: surface.secondaryContrast,
      },
      background: {
        default: "var(--bg, #FFF9EF)",
        paper: surface.paper,
      },
      text: {
        primary: surface.text,
        secondary: surface.textSecondary,
      },
    },
    typography: {
      fontFamily: fontStacks[direction],
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      // MUI lightens elevated paper in dark mode with a gradient overlay; keep
      // dialogs, menus and drawers on the same surface color as the app.
      MuiPaper: mode === "dark" ? { styleOverrides: { root: { backgroundImage: "none" } } } : {},
    },
  });
}

export const simorqTheme = createSimorqTheme("ltr");
