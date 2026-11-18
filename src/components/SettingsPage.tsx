import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { colorThemes, useThemeStore } from "../themeStore";
import { useLanguageStore } from "../i18n/languageStore";
import React from "react";

export default function SettingsPage() {
    const navigate = useNavigate();
    const locale = useLanguageStore((state) => state.locale);
    const themeId = useThemeStore((state) => state.themeId);
    const setTheme = useThemeStore((state) => state.setTheme);
    const isFa = locale === "fa";

    return (
        <Box sx={{ maxWidth: 720, mx: "auto", p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} aria-label={isFa ? "بازگشت" : "Back"} sx={{ color: "var(--navy)" }}>
                    {isFa ? <ArrowForwardIcon /> : <ArrowBackIcon />}
                </IconButton>
                <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--navy)" }}>
                    {isFa ? "تنظیمات" : "Settings"}
                </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: "var(--surface)", border: "1px solid var(--line)" }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", mb: 1.5 }}>
                    {isFa ? "رنگ‌بندی" : "Color theme"}
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.25 }}>
                    {colorThemes.map((theme, index) => (
                        <Box
                            key={theme.id}
                            component="button"
                            type="button"
                            onClick={() => setTheme(theme.id)}
                            aria-pressed={themeId === theme.id}
                            sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, border: "1px solid", borderColor: themeId === theme.id ? "var(--teal)" : "var(--line)", borderRadius: 1.75, p: 1, bgcolor: themeId === theme.id ? "var(--teal-soft)" : "var(--surface)", color: "var(--navy)", cursor: "pointer", font: "inherit", textAlign: "start", transition: "120ms ease", "&:hover": { borderColor: "var(--teal)", transform: "translateY(-1px)" }, "&:focus-visible": { outline: "2px solid var(--teal)", outlineOffset: 2 } }}
                        >
                            <Box sx={{ display: "flex", flexShrink: 0, overflow: "hidden", borderRadius: 1 }}>
                                {theme.colors.map((color) => <Box key={color} sx={{ width: 7, height: 26, bgcolor: color }} />)}
                            </Box>
                            <Typography component="span" sx={{ fontSize: 12.5, fontWeight: themeId === theme.id ? 700 : 500, whiteSpace: "nowrap" }}>
                                {index === 0 ? (isFa ? "تم اول" : "Theme 1") : theme.name[locale]}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* بعداً تنظیمات دیگه (اعلان‌ها، حریم خصوصی و ...) رو اینجا اضافه کن */}
        </Box>
    );
}