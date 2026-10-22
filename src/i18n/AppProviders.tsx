import React, { useMemo, type ReactNode } from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { createSimorqTheme } from "../muiTheme";
import { useLanguageStore } from "./languageStore";

const ltrCache = createCache({
  key: "muiltr",
});

const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [rtlPlugin],
});

export default function AppProviders({ children }: { children: ReactNode }) {
  const dir = useLanguageStore((state) => state.dir);
  const theme = useMemo(() => createSimorqTheme(dir), [dir]);
  const cache = dir === "rtl" ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}
