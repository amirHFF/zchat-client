import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
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

interface ProfileDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
    const t = useT();

    const username = keycloak.tokenParsed?.preferred_username ?? t("profile.user");
    const jid = username;

    function handleLogout() {
        keycloak.logout({
            redirectUri: window.location.origin + "/",
        });
    }

    const menuItems = [
        { icon: <SettingsOutlinedIcon />, label: t("profile.settings") },
        { icon: <BookmarkBorderOutlinedIcon />, label: t("profile.savedMessages") },
        { icon: <PeopleOutlineOutlinedIcon />, label: t("profile.contacts") },
        { icon: <HelpOutlineOutlinedIcon />, label: t("profile.help") },
    ];

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: 300,
                        maxWidth: "85vw",
                    },
                },
            }}
        >
            <Box
                sx={{
                    background: "var(--navy)",
                    color: "#fff",
                    p: 3,
                    pb: 2.5,
                    position: "relative",
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        insetInlineEnd: 8,
                        color: "rgba(255,255,255,.75)",
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Avatar
                    sx={{
                        width: 64,
                        height: 64,
                        bgcolor: "var(--teal)",
                        fontSize: 24,
                        mb: 1.5,
                    }}
                >
                    {username?.charAt(0)?.toUpperCase()}
                </Avatar>

                <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                    {username}
                </Typography>

                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
                    {jid}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    pt: 1.5,
                    pb: 0.5,
                }}
            >
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "var(--navy)" }}>
                    {t("profile.language")}
                </Typography>
                <LanguageSwitch />
            </Box>

            <List sx={{ py: 1 }}>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.label}
                        onClick={onClose}
                        sx={{
                            py: 1.25,
                            "&:hover": { background: "var(--teal-soft)" },
                        }}
                    >
                        <ListItemIcon sx={{ color: "var(--navy)", minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            slotProps={{
                                primary: {
                                    sx: { color: "var(--navy)", fontSize: 14.5, fontWeight: 500 },
                                },
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>

            <Divider sx={{ borderColor: "var(--line)" }} />

            <List sx={{ py: 1, mt: "auto" }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        py: 1.25,
                        "&:hover": { background: "rgba(211,47,47,.08)" },
                    }}
                >
                    <ListItemIcon sx={{ color: "#d32f2f", minWidth: 40 }}>
                        <LogoutOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t("profile.logOut")}
                        slotProps={{
                            primary: {
                                sx: { color: "#d32f2f", fontSize: 14.5, fontWeight: 600 },
                            },
                        }}
                    />
                </ListItemButton>
            </List>

        </Drawer>
    );
}