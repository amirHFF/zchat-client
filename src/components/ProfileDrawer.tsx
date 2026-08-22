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

interface ProfileDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {

    const username = keycloak.tokenParsed?.preferred_username ?? "User";
    const jid = username;

    function handleLogout() {
        keycloak.logout({
            redirectUri: window.location.origin + "/",
        });
    }

    const menuItems = [
        { icon: <SettingsOutlinedIcon />, label: "Settings" },
        { icon: <BookmarkBorderOutlinedIcon />, label: "Saved Messages" },
        { icon: <PeopleOutlineOutlinedIcon />, label: "Contacts" },
        { icon: <HelpOutlineOutlinedIcon />, label: "Help" },
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
                        right: 8,
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
                        primary="Log out"
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