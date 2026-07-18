import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";

import {
    Avatar,
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Fab,
    Paper,
    Stack,
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
    const [hoveredBot, setHoveredBot] = useState<typeof bots[number] | null>(null);

       const bots = [
        {
            id: 1,
            // title: "The Drunk Teacher",
            name: "سهیل",
            description: "به جدیت میتونم بگم بهترین معلممونه و خیلی خوب بهت بهت آموزش میده اما در مستی و زیاد صحبت هم میکنه . اخطار : سعی کن باهاش مودب باشی وگرنه مستیش گل میکنه و به مسخره بازی دی میاره"
        },
        {
            id: 2,
            // title: "The Hopeless Teacher",
            name: "منصور",
            description: "این معلم اخیرا تو زندگی شکست زیاد خورده و اصولا خیلی در درس دادن اشتیاق به خرج نمیده ، فقط دوست داره زود بهت درس بده و پولش رو از ما بگیره و بره سر بدبختیش"
        },
        {
            id: 3,
            // title: "The Clingy Teacher",
            name: "آزیتا",
            description: " راستش بسیار خانم معلم خوبیه ولی الان مجرد و تنهاست .کلی خواستکار داشته در دوران قدیم اما یه مقدار سطح انتظاراتش بالا بوده . یه مقدار هم شیطونه و لطفا سعی کنید در صحبت باهاش خیلی صمیمی نشید ، (زود وابسته میشه)"
        },
        {
            id: 4,
            // title: "The Arzash (Propaganda) Teacher",
            name: "سید علی",
            description: "این بنده خدا 20 سالشه اما به اندازه 21 سال خاطره جنگ براتون تعریف میکنه تلاش زیاد داره که شما رو بیاره تو خط ولایت و اینحور حرفا .درس های دینی رو عالی جواب میده"
        },
                {
            id: 5,
            // title: "The Jerk Teacher",
            name: "امیر ",
            description: "لطفا با این معلم صحبت نکنید"
        }
    ];
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
                    bottom: 35,
                    right: 24
                }}
                onClick={() => setOpen(true)}
            >
                <AddIcon />
            </Fab>

            <Dialog
                open={open}
                onClose={closeDialog}
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
                    <Box sx={{ mt: 3 }}>

                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 1 }}
                        >
                            AI Bots
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={2}
                            flexWrap="wrap"
                        >

                            {bots.map(bot => (

                                <Box
                                    key={bot.id}
                                    onMouseEnter={() => setHoveredBot(bot)}
                                    onClick={() => onCreateConversation(bot.name)}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        cursor: "pointer"
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 86,
                                            height: 86,
                                            fontSize:18,
                                            bgcolor: "primary.main",
                                            transition: "0.2s",
                                            "&:hover": {
                                                transform: "scale(1.20)",
                                                boxShadow: 4
                                            }
                                        }}
                                    >
                                        {bot.name}
                                    </Avatar>
                                </Box>


                            ))}


                        </Stack>
                        <Paper
                            variant="outlined"
                            sx={{
                                mt: 3,
                                p: 2,
                                minHeight: 90,
                                borderRadius: 2,
                                bgcolor: "grey.50"
                            }}
                        >
                            {hoveredBot ? (
                                <>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {hoveredBot.name}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {hoveredBot.description}
                                    </Typography>
                                </>
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Hover over an AI bot to see its description.
                                </Typography>
                            )}
                        </Paper>

                    </Box>


                </DialogContent>

            </Dialog>

        </>
    );

}