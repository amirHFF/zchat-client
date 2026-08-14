import { createTheme } from "@mui/material/styles";

export const simorqTheme = createTheme({
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
        fontFamily: "'Inter', sans-serif",
    },
    shape: {
        borderRadius: 12,
    },
});