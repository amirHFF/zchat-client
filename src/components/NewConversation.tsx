import { useEffect, useRef, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  Fab,
  Box,
  Dialog,
  Avatar,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  useMediaQuery,
} from "@mui/material";
import React from "react";
import type { ChatBot } from "../model/ChatBot";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";
import { useChatStore } from "../chatStore/ChatStore";

interface NewConversationProps {
  onCreateConversation: (username: string) => void;
}

const FAB_SIZE = 56;
const DRAG_THRESHOLD = 6;
const FAB_POSITION_KEY = "zchat.newConversationFab";
const FAB_HINT_KEY = "zchat.fabDragHint";

type FabPoint = { x: number; y: number };

function readSavedFabPosition(): FabPoint | null {
  try {
    const raw = localStorage.getItem(FAB_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FabPoint;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number")
      return null;
    return parsed;
  } catch {
    return null;
  }
}

function clampFabPosition(point: FabPoint): FabPoint {
  const margin = 12;
  const maxX = Math.max(margin, window.innerWidth - FAB_SIZE - margin);
  const maxY = Math.max(margin, window.innerHeight - FAB_SIZE - margin);
  return {
    x: Math.min(Math.max(point.x, margin), maxX),
    y: Math.min(Math.max(point.y, margin), maxY),
  };
}

export default function NewConversation({
  onCreateConversation,
}: NewConversationProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [bots, setBots] = useState<ChatBot[]>([]);
  const isMobile = useMediaQuery("(max-width:426px)", { noSsr: true });
  const selectedConversation = useChatStore(
    (state) => state.selectedConversation,
  );
  const [hoveredBot, setHoveredBot] = useState<ChatBot | null>(null);
  const [dragPosition, setDragPosition] = useState<FabPoint | null>(() =>
    readSavedFabPosition(),
  );
  const [dragging, setDragging] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(
    () => localStorage.getItem(FAB_HINT_KEY) === "1",
  );
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const liftFab = !isMobile && Boolean(selectedConversation);
  const showDragHint = liftFab && !hintDismissed;

  useEffect(() => {
    if (!showDragHint) return;

    const timer = window.setTimeout(() => {
      localStorage.setItem(FAB_HINT_KEY, "1");
      setHintDismissed(true);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [showDragHint]);

  useEffect(() => {
    function keepInsideViewport() {
      setDragPosition((current) => {
        if (!current) return current;
        const next = clampFabPosition(current);
        localStorage.setItem(FAB_POSITION_KEY, JSON.stringify(next));
        return next;
      });
    }

    window.addEventListener("resize", keepInsideViewport);
    return () => window.removeEventListener("resize", keepInsideViewport);
  }, []);

  function defaultLiftPosition(): FabPoint {
    return clampFabPosition({
      x: window.innerWidth - 32 - FAB_SIZE,
      y: Math.round(window.innerHeight / 2 - FAB_SIZE / 2),
    });
  }

  function handleFabPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!liftFab || event.button !== 0) return;

    const origin = dragPosition ?? defaultLiftPosition();
    const drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
      moved: false,
      latest: origin,
    };
    dragRef.current = drag;

    function onMove(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== drag.pointerId) return;

      const dx = moveEvent.clientX - drag.startX;
      const dy = moveEvent.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

      if (!drag.moved) {
        localStorage.setItem(FAB_HINT_KEY, "1");
        setHintDismissed(true);
        setDragging(true);
      }
      drag.moved = true;
      drag.latest = clampFabPosition({
        x: drag.originX + dx,
        y: drag.originY + dy,
      });
      setDragPosition(drag.latest);
    }

    function onUp(upEvent: PointerEvent) {
      if (upEvent.pointerId !== drag.pointerId) return;

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      dragRef.current = null;

      if (!drag.moved) return;

      suppressClickRef.current = true;
      localStorage.setItem(FAB_POSITION_KEY, JSON.stringify(drag.latest));
      setDragging(false);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  async function fetchBots() {
    try {
      const fetched = await OrchestratorRestClient.getAllChatBots();
      setBots(fetched ?? []);
    } catch (err) {
      console.error("Error loading bots:", err);
    }
  }

  //method
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

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <>
      <Box
        className="new-conversation-fab"
        sx={{
          position: "fixed",
          zIndex: 1300,
          width: FAB_SIZE,
          height: FAB_SIZE,
          ...(liftFab && dragPosition
            ? {
                left: dragPosition.x,
                top: dragPosition.y,
                right: "auto",
                bottom: "auto",
              }
            : liftFab
              ? {
                  right: 32,
                  top: "50%",
                  bottom: "auto",
                  left: "auto",
                  transform: "translateY(-50%)",
                }
              : {
                  right: 32,
                  bottom: 50,
                  top: "auto",
                  left: "auto",
                }),
        }}
      >
        {showDragHint && (
          <Box
            sx={{
              position: "absolute",
              right: "calc(100% + 12px)",
              top: "50%",
              transform: "translateY(-50%)",
              px: 1.5,
              py: 0.85,
              borderRadius: "10px",
              bgcolor: "var(--navy)",
              color: "#fff",
              fontFamily: "var(--font-body)",
              fontSize: "12.5px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 10px 24px rgba(15,42,74,.22)",
            }}
          >
            برای جابه‌جایی بکشید
          </Box>
        )}
        <Fab
          color="primary"
          sx={{
            position: "absolute",
            inset: 0,
            boxShadow: "0 12px 28px rgba(15,42,74,.28)",
            touchAction: liftFab ? "none" : "auto",
            cursor: liftFab ? (dragging ? "grabbing" : "grab") : "pointer",
          }}
          onPointerDown={handleFabPointerDown}
          onClick={() => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }
            setOpen(true);
            void fetchBots();
          }}
        >
          <AddIcon />
        </Fab>
      </Box>

      <Dialog
        open={open}
        onClose={closeDialog}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: isMobile
              ? {
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  height: "100dvh",
                  maxHeight: "100dvh",
                  m: 0,
                  overflow: "hidden",
                  borderRadius: 0,
                }
              : { borderRadius: "18px" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "var(--navy)",
          }}
        >
          {isMobile && (
            <IconButton
              aria-label="Back to contacts"
              edge="start"
              onClick={closeDialog}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          New Conversation
        </DialogTitle>

        <DialogContent
          sx={
            isMobile
              ? {
                  display: "flex",
                  flex: "1 1 auto",
                  flexDirection: "column",
                  minHeight: 0,
                  overflow: "hidden",
                }
              : undefined
          }
        >
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

          <Box
            sx={
              isMobile
                ? {
                    display: "flex",
                    flex: "1 1 auto",
                    flexDirection: "column",
                    minHeight: 0,
                    mt: 3,
                  }
                : { mt: 3 }
            }
          >
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
                  maxHeight: isMobile ? "none" : 260,
                  flex: isMobile ? "1 1 auto" : undefined,
                  minHeight: isMobile ? 0 : undefined,
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
                {bots.map((bot) => (
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
