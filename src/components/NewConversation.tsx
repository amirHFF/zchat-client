import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    Fab,
    TextField,
    Typography
} from "@mui/material";
import React from "react";

interface NewConversationProps {

    onCreateConversation: (username: string) => void;

}

export default function NewConversation(
    {
        onCreateConversation
    }: NewConversationProps
) {

    const [open, setOpen] = useState(false);

    const [username, setUsername] = useState("");

    function closeDialog() {

        setOpen(false);

        setUsername("");

    }

    function handleSubmit() {

        const value = username.trim();

        if (value.length === 0) {
            return;
        }

        onCreateConversation(value);

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
                    bottom: 50,
                    right: 24
                }}
                onClick={() => setOpen(true)}
            >
                <AddIcon />
            </Fab>

            <Dialog
                open={open}
                onClose={closeDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>

                    New Conversation

                </DialogTitle>

                <DialogContent>

                    <Typography
                        variant="body2"
                        sx={{
                            mb: 2
                        }}
                    >
                        Enter the username of the person you want to chat with.
                    </Typography>

                    <TextField
                        autoFocus
                        fullWidth
                        label="Username"
                        placeholder="Example: ali"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                    />

                </DialogContent>

            </Dialog>

        </>
    );

}