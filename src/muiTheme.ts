import { createTheme } from "@mui/material/styles";
import type { Direction } from "./i18n/translations";

const fontStacks = {
  ltr: "'Inter', sans-serif",
  rtl: "'Vazirmatn', sans-serif",
} as const;

export function createSimorqTheme(direction: Direction) {
  return createTheme({
    direction,
    palette: {
      primary: {
        main: "#356AE6",
        dark: "#2457C5",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#20AFA3",
        light: "#DDF6F2",
        contrastText: "#17243A",
      },
      background: {
        default: "#FFF9EF",
        paper: "#ffffff",
      },
      text: {
        primary: "#20304A",
        secondary: "#5B6B82",
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
