import { useEffect, useState } from "react";

import AddIcon from "@mui/icons-material/Add";

import {
    Avatar,
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Fab,
    TextField,
    Typography
} from "@mui/material";
import React from "react";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";
import type { ChatBot } from "../model/ChatBot";

interface NewConversationProps {
    onCreateConversation: (username: string) => void;
}

export default function NewConversation(
    {
        onCreateConversation
    }: NewConversationProps
) {

    const [bots, setBots] = useState<ChatBot[]>([]);
    const [hoveredBot, setHoveredBot] = useState<ChatBot | null>(null);
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        fetchBots();
    }, []);

    async function fetchBots() {
        try {
            const fetched = await OrchestratorRestClient.getAllChatBots();
            setBots(fetched ?? []);
        } catch (err) {
            console.error("Error loading bots:", err);
        }
    }

    function closeDialog() {
        setOpen(false);
        setUsername("");
        setHoveredBot(null);
    }

    function handleSubmit() {
        const value = username.trim();

        if (value.length === 0) {
            return;
        }

        onCreateConversation(value);
        closeDialog();
    }

    function handleBotSelect(bot: ChatBot) {
        onCreateConversation(bot.botID);
        closeDialog();
    }

    function handleKeyDown(
        event: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
        }
    }

    return (
        <>
            <Fab
                color="primary"
                sx={{
                    position: "fixed",
                    bottom: 32,
                    right: 32,
                    boxShadow: "0 12px 28px rgba(15,42,74,.28)",
                }}
                onClick={() => setOpen(true)}
            >
                <AddIcon />
            </Fab>

            <Dialog
                open={open}
                onClose={closeDialog}
                maxWidth="xs"
                fullWidth
                slotProps={{
                    paper: {
                        sx: { borderRadius: "18px" }
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        color: "var(--navy)",
                    }}
                >
                    New Conversation
                </DialogTitle>

                <DialogContent>

                    <Typography
                        variant="body2"
                        sx={{ mb: 2, color: "var(--text-secondary)" }}
                    >
                        Enter the username of the person you want to chat with.
                    </Typography>

                    <TextField
                        autoFocus
                        fullWidth
                        label="Username"
                        placeholder="Example: ali"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                    <Box sx={{ mt: 3 }}>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 1.5,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 600,
                                    color: "var(--navy)",
                                }}
                            >
                                AI Bots
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: "var(--teal)",
                                    fontWeight: 600,
                                    fontSize: "12.5px",
                                    opacity: hoveredBot ? 1 : 0,
                                    transition: "opacity 0.15s",
                                }}
                            >
                                {hoveredBot?.displayName}
                            </Typography>
                        </Box>

                        {bots.length === 0 ? (
                            <Typography
                                variant="body2"
                                sx={{ color: "var(--text-secondary)" }}
                            >
                                No bots available right now.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    maxHeight: 260,
                                    overflowY: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    pr: 0.5,
                                    "&::-webkit-scrollbar": {
                                        width: "6px",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        background: "var(--line)",
                                        borderRadius: "6px",
                                    },
                                }}
                            >
                                {bots.map(bot => (
                                    <Box
                                        key={bot.botID}
                                        onClick={() => handleBotSelect(bot)}
                                        onMouseEnter={() => setHoveredBot(bot)}
                                        onMouseLeave={() => setHoveredBot(null)}
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 1.5,
                                            p: 1.25,
                                            borderRadius: "12px",
                                            border: "1px solid var(--line)",
                                            cursor: "pointer",
                                            transition: "0.2s",
                                            "&:hover": {
                                                background: "var(--teal-soft)",
                                                borderColor: "var(--teal)",
                                            },
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                fontSize: 14,
                                                bgcolor: "secondary.main",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {bot.displayName}
                                        </Avatar>

                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ fontWeight: 700, color: "var(--navy)" }}
                                            >
                                                {bot.displayName}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "var(--text-secondary)",
                                                    fontSize: "12.5px",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {bot.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}

                    </Box>

                </DialogContent>

            </Dialog>

        </>
    );
}