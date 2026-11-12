import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import keycloak from "../auth/Keycloak";
import React from "react";
import LanguageSwitch from "./LanguageSwitch";
import { useT } from "../i18n/useT";
import { useNavigate } from "react-router-dom";
import { colorThemes, useThemeStore } from "../themeStore";
import { useLanguageStore } from "../i18n/languageStore";

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const t = useT();
  const navigate = useNavigate();
  const themeId = useThemeStore((state) => state.themeId);
  const setTheme = useThemeStore((state) => state.setTheme);
  const locale = useLanguageStore((state) => state.locale);
  const username = keycloak.tokenParsed?.preferred_username ?? t("profile.user");

  const menuItems = [
    { icon: <SettingsOutlinedIcon />, label: t("profile.settings") },
    { icon: <BookmarkBorderOutlinedIcon />, label: t("profile.savedMessages") },
    { icon: <PeopleOutlineOutlinedIcon />, label: t("profile.DashboarTeacher"), path: "/chat/dashboard-teacher" },
    { icon: <HelpOutlineOutlinedIcon />, label: t("profile.help") },
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 340, maxWidth: "85vw", bgcolor: "var(--bg)", borderInlineStart: "1px solid var(--line)" } } }}
    >
      <Box sx={{ position: "relative", overflow: "hidden", px: 2.5, pt: 4, pb: 2.25, color: "#fff", background: "linear-gradient(145deg, var(--navy), var(--navy-strong))", "&::after": { content: '""', position: "absolute", width: 170, height: 170, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", insetInlineEnd: -75, top: -90 } }}>
        <IconButton onClick={onClose} aria-label={locale === "fa" ? "بستن" : "Close menu"} sx={{ position: "absolute", top: 10, insetInlineEnd: 8, color: "rgba(255,255,255,.75)", zIndex: 1, "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,.12)" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <Avatar sx={{ width: 54, height: 54, bgcolor: "var(--teal)", color: "var(--navy-strong)", fontSize: 22, fontWeight: 800, mb: 1.25, border: "2px solid rgba(255,255,255,.55)", boxShadow: "0 8px 20px rgba(0,0,0,.14)" }}>
          {username.charAt(0).toUpperCase()}
        </Avatar>
        <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, lineHeight: 1.35 }}>{username}</Typography>
        <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,.68)", mt: 0.25 }}>{username}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mx: 1.5, mt: 1.5, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: "var(--surface)", border: "1px solid var(--line)" }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{t("profile.language")}</Typography>
        <LanguageSwitch />
      </Box>

      <List sx={{ px: 1.5, py: 1.25 }}>
        {menuItems.map((item) => (
          <ListItemButton key={item.label} onClick={() => { onClose(); if ("path" in item && item.path) navigate(item.path); }} sx={{ py: 1.1, px: 1.25, mb: 0.5, borderRadius: 2, "&:hover": { bgcolor: "var(--teal-soft)" } }}>
            <ListItemIcon sx={{ color: "var(--teal)", minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} slotProps={{ primary: { sx: { color: "var(--navy)", fontSize: 14, fontWeight: 600 } } }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mx: 1.5, mt: 0.5, mb: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: "var(--surface)", border: "1px solid var(--line)" }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", mb: 1.25 }}>{locale === "fa" ? "رنگ‌بندی" : "Color theme"}</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          {colorThemes.map((theme, index) => (
            <Box key={theme.id} component="button" type="button" onClick={() => setTheme(theme.id)} aria-pressed={themeId === theme.id} sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0, border: "1px solid", borderColor: themeId === theme.id ? "var(--teal)" : "var(--line)", borderRadius: 1.75, p: 0.8, bgcolor: themeId === theme.id ? "var(--teal-soft)" : "var(--surface)", color: "var(--navy)", cursor: "pointer", font: "inherit", textAlign: "start", transition: "120ms ease", "&:hover": { borderColor: "var(--teal)", transform: "translateY(-1px)" }, "&:focus-visible": { outline: "2px solid var(--teal)", outlineOffset: 2 } }}>
              <Box sx={{ display: "flex", flexShrink: 0, overflow: "hidden", borderRadius: 1 }}>
                {theme.colors.map((color) => <Box key={color} sx={{ width: 6, height: 22, bgcolor: color }} />)}
              </Box>
              <Typography component="span" sx={{ fontSize: 11.5, fontWeight: themeId === theme.id ? 700 : 500, whiteSpace: "nowrap" }}>
                {index === 0 ? (locale === "fa" ? "تم اول" : "Theme 1") : theme.name[locale]}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <List sx={{ px: 1.5, py: 1, mt: "auto" }}>
        <ListItemButton onClick={() => keycloak.logout({ redirectUri: window.location.origin + "/" })} sx={{ py: 1.1, px: 1.25, borderRadius: 2, color: "#d32f2f", "&:hover": { bgcolor: "rgba(211,47,47,.08)" } }}>
          <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}><LogoutOutlinedIcon /></ListItemIcon>
          <ListItemText primary={t("profile.logOut")} slotProps={{ primary: { sx: { color: "inherit", fontSize: 14, fontWeight: 600 } } }} />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
