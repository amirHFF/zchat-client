import React, { useMemo, type ReactNode } from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { createSimorqTheme } from "../muiTheme";
import { useLanguageStore } from "./languageStore";
import { useThemeStore, colorThemes } from "../themeStore";

const ltrCache = createCache({
  key: "muiltr",
});

const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [rtlPlugin],
});

export default function AppProviders({ children }: { children: ReactNode }) {
  const dir = useLanguageStore((state) => state.dir);
  const themeId = useThemeStore((state) => state.themeId);
  const palette = colorThemes.find((item) => item.id === themeId) ?? colorThemes[0];
  const muiColors = themeId === "forest"
    ? [palette.colors[1], palette.colors[2]]
    : themeId === "warm"
      ? [palette.colors[3], palette.colors[2]]
      : [palette.colors[0], palette.colors[1]];
  const theme = useMemo(() => createSimorqTheme(dir, muiColors), [dir, muiColors[0], muiColors[1]]);
  React.useEffect(() => {
    document.documentElement.dataset.colorTheme = themeId;
  }, [themeId]);
  const cache = dir === "rtl" ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}
