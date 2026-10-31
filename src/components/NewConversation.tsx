import { useEffect, useRef, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import {
  Fab,
  Box,
  Tab,
  Tabs,
  Button,
  Dialog,
  Avatar,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import React from "react";
import type { ChatBot } from "../model/ChatBot";
import type { UserProfile } from "../model/UserProfile";
import { useChatStore } from "../chatStore/ChatStore";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";
import { useLanguageStore } from "../i18n/languageStore";
import { useT } from "../i18n/useT";

interface NewConversationProps {
  onCreateConversation: (username: string) => void;
  onCreateBotConversation: (
    botId: string,
    botParticipationCode: string,
  ) => void;
}

const FAB_SIZE = 56;
const DRAG_THRESHOLD = 6;
const SEARCH_MIN_LENGTH = 4;
const SEARCH_DEBOUNCE_MS = 400;
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

function botMatchesQuery(bot: ChatBot, query: string) {
  const normalized = query.toLowerCase();
  return [bot.displayName, bot.name, bot.botID, bot.description].some((value) =>
    value?.toLowerCase().includes(normalized),
  );
}

export default function NewConversation({
  onCreateConversation,
  onCreateBotConversation,
}: NewConversationProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState("");
  //search users and bots
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const t = useT();
  const dir = useLanguageStore((state) => state.dir);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(
    null,
  );
  const [botQuery, setBotQuery] = useState("");
  const [appliedBotQuery, setAppliedBotQuery] = useState("");
  const [botSearching, setBotSearching] = useState(false);
  const [pendingBot, setPendingBot] = useState<ChatBot | null>(null);
  const [participationCode, setParticipationCode] = useState("");
  const [hasParticipationCode, setHasParticipationCode] = useState(false);
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
  const searchRequestRef = useRef(0);
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
    const margin = 32;
    return clampFabPosition({
      x: dir === "rtl" ? margin : window.innerWidth - margin - FAB_SIZE,
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
    searchRequestRef.current += 1;
    setOpen(false);
    setTab(0);
    setUsername("");
    //reset search results
    setProfiles([]);
    setSearching(false);
    setSearched(false);
    setSearchError(false);
    setPendingProfile(null);
    //reset bot search results
    setBotQuery("");
    setAppliedBotQuery("");
    setBotSearching(false);
    setPendingBot(null);
    setParticipationCode("");
    setHoveredBot(null);
  }

  function handleUsernameChange(value: string) {
    setUsername(value);
    if (value.trim().length >= SEARCH_MIN_LENGTH) return;

    searchRequestRef.current += 1;
    setProfiles([]);
    setSearching(false);
    setSearched(false);
    setSearchError(false);
  }

  useEffect(() => {
    if (!open || tab !== 0) return;

    const value = username.trim();
    if (value.length < SEARCH_MIN_LENGTH) return;

    const requestId = ++searchRequestRef.current;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError(false);
      try {
        const found = await OrchestratorRestClient.searchProfiles(value);
        if (requestId !== searchRequestRef.current) return;
        setProfiles(found);
        setSearched(true);
      } catch (err) {
        if (requestId !== searchRequestRef.current) return;
        console.error("Error searching profiles:", err);
        setSearchError(true);
      } finally {
        if (requestId === searchRequestRef.current) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [username, open, tab]);

  function handleBotQueryChange(value: string) {
    setBotQuery(value);
    if (value.trim().length >= SEARCH_MIN_LENGTH) {
      setBotSearching(true);
      return;
    }

    setAppliedBotQuery("");
    setBotSearching(false);
  }

  useEffect(() => {
    if (!open || tab !== 1) return;

    const value = botQuery.trim();
    if (value.length < SEARCH_MIN_LENGTH) return;

    const timer = window.setTimeout(() => {
      setAppliedBotQuery(value);
      setBotSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [botQuery, open, tab]);

  function profileLabel(profile: UserProfile) {
    const displayName = profile.displayName?.trim();
    if (displayName) return displayName;

    const fullName = [profile.firstName, profile.lastname]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || profile.username;
  }

  function confirmAddProfile() {
    if (!pendingProfile) return;

    onCreateConversation(pendingProfile.username);
    closeDialog();
  }

  function confirmAddBot() {
    if (!pendingBot) return;

    onCreateBotConversation(
      pendingBot.botID,
      hasParticipationCode ? participationCode.trim() : "",
    );
    closeDialog();
  }

  const usernameLength = username.trim().length;
  const usernameTooShort =
    usernameLength > 0 && usernameLength < SEARCH_MIN_LENGTH;
  const botQueryLength = botQuery.trim().length;
  const botQueryTooShort =
    botQueryLength > 0 && botQueryLength < SEARCH_MIN_LENGTH;
  const visibleBots = appliedBotQuery
    ? bots.filter((bot) => botMatchesQuery(bot, appliedBotQuery))
    : bots;

  return (
    <>
      <Box
        className="new-conversation-fab"
        style={
          liftFab && dragPosition
            ? {
                left: dragPosition.x,
                top: dragPosition.y,
                right: "auto",
                bottom: "auto",
                transform: "none",
              }
            : undefined
        }
        sx={{
          position: "fixed",
          zIndex: 1300,
          width: FAB_SIZE,
          height: FAB_SIZE,
          ...(liftFab && dragPosition
            ? {}
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
              boxShadow: "0 10px 24px rgba(32,48,74,.22)",
            }}
          >
            {t("newConversation.dragHint")}
          </Box>
        )}
        <Fab
          color="primary"
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "var(--navy-strong)",
            boxShadow: "0 12px 28px rgba(32,48,74,.24)",
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
          component="div"
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
              aria-label={t("newConversation.backToContacts")}
              edge="start"
              onClick={closeDialog}
            >
              {dir === "rtl" ? <ArrowForwardIcon /> : <ArrowBackIcon />}
            </IconButton>
          )}
          <Tabs
            value={tab}
            onChange={(_, next) => setTab(next)}
            variant="fullWidth"
            sx={{
              flex: 1,
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                textTransform: "none",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--text-secondary)",
              },
              "& .Mui-selected": {
                color: "var(--navy)",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "var(--teal)",
              },
            }}
          >
            <Tab label={t("newConversation.tabConversation")} />
            <Tab label={t("newConversation.tabBot")} />
          </Tabs>
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
          {tab === 1 ? (
            <>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "var(--text-secondary)" }}
              >
                {t("newConversation.searchBot")}
              </Typography>

              <TextField
                fullWidth
                label={t("newConversation.bot")}
                placeholder={t("newConversation.botPlaceholder")}
                value={botQuery}
                onChange={(e) => handleBotQueryChange(e.target.value)}
                helperText={
                  botQueryTooShort ? t("newConversation.minChars") : " "
                }
                slotProps={{
                  formHelperText: {
                    sx: {
                      color: botQueryTooShort ? "warning.main" : "transparent",
                      mx: 0,
                    },
                  },
                }}
              />

              {botSearching && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <CircularProgress size={16} />
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text-secondary)" }}
                  >
                    {t("newConversation.searching")}
                  </Typography>
                </Box>
              )}

              <Box
                sx={
                  isMobile
                    ? {
                        display: "flex",
                        flex: "1 1 auto",
                        flexDirection: "column",
                        minHeight: 0,
                        mt: 1,
                      }
                    : { mt: 1 }
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
                    {t("newConversation.aiBots")}
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
                    {t("newConversation.noBots")}
                  </Typography>
                ) : visibleBots.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text-secondary)" }}
                  >
                    {t("newConversation.noBotsFound")}
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
                    {visibleBots.map((bot) => (
                      <Box
                        key={bot.botID}
                        onClick={() => {
                          setParticipationCode("");
                          setParticipationCode("");
                          setHasParticipationCode(false);
                          setPendingBot(bot);
                        }}
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
            </>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "var(--text-secondary)" }}
              >
                {t("newConversation.searchUser")}
              </Typography>

              <TextField
                autoFocus
                fullWidth
                label={t("newConversation.username")}
                placeholder={t("newConversation.usernamePlaceholder")}
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                helperText={
                  usernameTooShort ? t("newConversation.minChars") : " "
                }
                slotProps={{
                  formHelperText: {
                    sx: {
                      color: usernameTooShort ? "warning.main" : "transparent",
                      mx: 0,
                    },
                  },
                }}
              />

              {searching && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <CircularProgress size={16} />
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text-secondary)" }}
                  >
                    {t("newConversation.searching")}
                  </Typography>
                </Box>
              )}

              {searchError && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1.5, color: "error.main" }}
                >
                  {t("newConversation.searchError")}
                </Typography>
              )}

              {searched && profiles.length === 0 && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1.5, color: "var(--text-secondary)" }}
                >
                  {t("newConversation.noUsers")}
                </Typography>
              )}

              {profiles.length > 0 && (
                <Box
                  sx={{
                    mt: 1.5,
                    maxHeight: isMobile ? 220 : 180,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pr: 0.5,
                  }}
                >
                  {profiles.map((profile) => (
                    <Box
                      key={profile.username}
                      onClick={() => setPendingProfile(profile)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
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
                          width: 40,
                          height: 40,
                          fontSize: 14,
                          bgcolor: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        {profileLabel(profile).slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: "var(--navy)" }}
                        >
                          {profileLabel(profile)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "var(--text-secondary)",
                            fontSize: "12.5px",
                          }}
                        >
                          {profile.username}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingProfile)}
        onClose={() => setPendingProfile(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "var(--navy)",
          }}
        >
          {t("newConversation.addUserTitle")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
            {pendingProfile
              ? t("newConversation.addUserBody", {
                  name: profileLabel(pendingProfile),
                  username: pendingProfile.username,
                })
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setPendingProfile(null)}
            sx={{ textTransform: "none" }}
          >
            {t("newConversation.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={confirmAddProfile}
            sx={{ textTransform: "none" }}
          >
            {t("newConversation.add")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(pendingBot)}
        onClose={() => setPendingBot(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "var(--navy)",
          }}
        >
          {t("newConversation.addBotTitle")}
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ color: "var(--text-secondary)", mb: 2 }}
          >
            {pendingBot
              ? t("newConversation.addBotBody", {
                  name: pendingBot.displayName,
                  id: pendingBot.botID,
                })
              : ""}
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={hasParticipationCode}
                onChange={(event) => {
                  setHasParticipationCode(event.target.checked);
                  if (!event.target.checked) setParticipationCode("");
                }}
              />
            }
            label={t("newConversation.hasParticipationCode")}
          />
          <TextField
            fullWidth
            disabled={!hasParticipationCode}
            helperText={
              hasParticipationCode
                ? " "
                : t("newConversation.enableParticipationCodeHint")
            }
            sx={{
              "& .MuiInputBase-root.Mui-disabled": {
                backgroundColor: "var(--surface-muted, #f1f3f5)",
                cursor: "not-allowed",
              },
              "& .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline":
                {
                  borderStyle: "dashed",
                },
            }}
            label={t("newConversation.participationCode")}
            placeholder={t("newConversation.codePlaceholder")}
            value={participationCode}
            onChange={(e) => setParticipationCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setPendingBot(null)}
            sx={{ textTransform: "none" }}
          >
            {t("newConversation.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={confirmAddBot}
            sx={{ textTransform: "none" }}
          >
            {t("newConversation.add")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
