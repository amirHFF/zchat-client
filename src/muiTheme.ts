import { createTheme } from "@mui/material/styles";
import type { Direction } from "./i18n/translations";

const fontStacks = {
  ltr: "'Inter', sans-serif",
  rtl: "'Vazirmatn', sans-serif",
} as const;

export function createSimorqTheme(direction: Direction, colors: readonly string[] = ["#356AE6", "#20AFA3", "#FFC857", "#FF7A70"]) {
  const [primary, secondary] = colors;
  return createTheme({
    direction,
    palette: {
      primary: {
        main: primary,
        dark: primary,
        contrastText: "#ffffff",
      },
      secondary: {
        main: secondary,
        light: `${secondary}33`,
        contrastText: "#17243A",
      },
      background: {
        default: "var(--bg, #FFF9EF)",
        paper: "#ffffff",
      },
      text: {
        primary: "var(--navy, #20304A)",
        secondary: "var(--text-secondary, #5B6B82)",
      },
    },
    typography: {
      fontFamily: fontStacks[direction],
    },
    shape: {
      borderRadius: 12,
    },
  });
}

export const simorqTheme = createSimorqTheme("ltr");
