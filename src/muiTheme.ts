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
        main: "#0F2A4A",
        dark: "#0A1D34",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#1FA6A6",
        light: "#6FE3D9",
        contrastText: "#ffffff",
      },
      background: {
        default: "#F6F5F0",
        paper: "#ffffff",
      },
      text: {
        primary: "#0F2A4A",
        secondary: "#55627A",
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
