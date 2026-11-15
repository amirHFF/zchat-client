import { useEffect, useRef, useState } from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import {
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
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";
import { useLanguageStore } from "../i18n/languageStore";
import { useT } from "../i18n/useT";

/** 0 = new user conversation, 1 = new bot conversation */
export type NewConversationTab = 0 | 1;

interface NewConversationProps {
  open: boolean;
  initialTab?: NewConversationTab;
  onClose: () => void;
  onCreateConversation: (username: string) => void;
  onCreateBotConversation: (
    botId: string,
    botParticipationCode: string,
  ) => void;
}

const SEARCH_MIN_LENGTH = 4;
const SEARCH_DEBOUNCE_MS = 400;

function botMatchesQuery(bot: ChatBot, query: string) {
  const normalized = query.toLowerCase();
  return [bot.displayName, bot.name, bot.botID, bot.description].some((value) =>
    value?.toLowerCase().includes(normalized),
  );
}

export default function NewConversation({
  open,
  initialTab = 0,
  onClose,
  onCreateConversation,
  onCreateBotConversation,
}: NewConversationProps) {
  const [tab, setTab] = useState<number>(initialTab);
  const [prevOpen, setPrevOpen] = useState(open);
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
  const isMobile = useMediaQuery("(max-width:640px)", { noSsr: true });
  const [hoveredBot, setHoveredBot] = useState<ChatBot | null>(null);
  const searchRequestRef = useRef(0);

  // Show the tab the user asked for (conversation or bot) each time the
  // dialog opens. Adjusting state during render avoids an extra effect pass.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setTab(initialTab);
  }

  // Refresh the bot list whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    OrchestratorRestClient.getAllChatBots()
      .then((fetched) => {
        if (!cancelled) setBots(fetched ?? []);
      })
      .catch((err) => console.error("Error loading bots:", err));
    return () => {
      cancelled = true;
    };
  }, [open]);

  //method
  function closeDialog() {
    searchRequestRef.current += 1;
    onClose();
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
                      textTransform: "lowercase",
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
                            textTransform: "lowercase",
                          }}
                        >
                          {bot.displayName}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: "var(--navy)",
                              textTransform: "lowercase",
                            }}
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
                          sx={{
                            fontWeight: 700,
                            color: "var(--navy)",
                            textTransform: "lowercase",
                          }}
                        >
                          {profileLabel(profile)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "var(--text-secondary)",
                            fontSize: "12.5px",
                            textTransform: "lowercase",
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
