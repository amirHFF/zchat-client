import "./BotManagement.css";
import { useT } from "../i18n/useT";
import UserAvatar from "./UserAvatar";
import {
  ChatContainer,
  ConversationHeader,
  Message,
  MessageList,
} from "@chatscope/chat-ui-kit-react";
import keycloak from "../auth/Keycloak";
import MarkdownMessage from "./MarkdownMessage";
import type { ChatBot } from "../model/ChatBot";
import type { UserProfile } from "../model/UserProfile";
import type { ChatMessage } from "../model/ChatMessage";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { formatMessageTime } from "../utils/formatTimestamp";
import CircularProgress from "@mui/material/CircularProgress";
import type { ConversationModel } from "../model/ConversationModel";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";

export default function BotManagement() {
  const t = useT();
  const [bots, setBots] = useState<ChatBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [participantsError, setParticipantsError] = useState(false);
  const [participants, setParticipants] = useState<UserProfile[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [selectedBotID, setSelectedBotID] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(
    null,
  );
  const [highlightedStudentUsername, setHighlightedStudentUsername] = useState<
    string | null
  >(null);
  const [studentConversations, setStudentConversations] = useState<
    ConversationModel[]
  >([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationModel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(false);
  const participantsRequestRef = useRef(0);
  const conversationsRequestRef = useRef(0);
  const messagesRequestRef = useRef(0);
  const botListRef = useRef<HTMLDivElement | null>(null);
  const previousScrollTopRef = useRef(0);
  const restoreListScrollRef = useRef(false);
  const username = keycloak.tokenParsed?.preferred_username;

  useLayoutEffect(() => {
    if (
      !selectedStudent &&
      restoreListScrollRef.current &&
      botListRef.current
    ) {
      botListRef.current.scrollTop = previousScrollTopRef.current;
      restoreListScrollRef.current = false;
    }
  }, [selectedStudent]);

  const handleBotClick = async (bot: ChatBot) => {
    conversationsRequestRef.current += 1;
    messagesRequestRef.current += 1;
    setSelectedStudent(null);
    setStudentConversations([]);
    setSelectedConversation(null);
    setMessages([]);

    if (selectedBotID === bot.botID) {
      participantsRequestRef.current += 1;
      setSelectedBotID(null);
      setParticipantsLoading(false);
      setSelectedStudent(null);
      setHighlightedStudentUsername(null);
      return;
    }

    const requestId = ++participantsRequestRef.current;
    setSelectedBotID(bot.botID);
    setParticipants([]);
    setParticipantsError(false);
    setParticipantsLoading(true);

    try {
      const items = await OrchestratorRestClient.getBotParticipants(bot.botID);
      if (requestId === participantsRequestRef.current) setParticipants(items);
    } catch (error) {
      console.error("Error loading bot participants:", error);
      if (requestId === participantsRequestRef.current) {
        setParticipantsError(true);
      }
    } finally {
      if (requestId === participantsRequestRef.current) {
        setParticipantsLoading(false);
      }
    }
  };

  const handleStudentClick = async (student: UserProfile) => {
    if (!selectedBotID) return;

    previousScrollTopRef.current = botListRef.current?.scrollTop ?? 0;
    setHighlightedStudentUsername(student.username);
    restoreListScrollRef.current = false;
    const requestId = ++conversationsRequestRef.current;
    messagesRequestRef.current += 1;
    setSelectedStudent(student);
    setStudentConversations([]);
    setConversationsError(false);
    setConversationsLoading(true);
    setSelectedConversation(null);
    setMessages([]);
    setMessagesError(false);
    setMessagesLoading(false);

    try {
      const items = await OrchestratorRestClient.getStudentBotConversations(
        student.username,
        selectedBotID,
      );
      if (requestId === conversationsRequestRef.current) {
        setStudentConversations(items);
      }
    } catch (error) {
      console.error("Error loading student bot conversations:", error);
      if (requestId === conversationsRequestRef.current) {
        setConversationsError(true);
      }
    } finally {
      if (requestId === conversationsRequestRef.current) {
        setConversationsLoading(false);
      }
    }
  };

  const handleBackToStudents = () => {
    conversationsRequestRef.current += 1;
    messagesRequestRef.current += 1;
    setConversationsLoading(false);
    setMessagesLoading(false);
    restoreListScrollRef.current = true;
    setSelectedStudent(null);
  };

  const handleConversationClick = async (conversation: ConversationModel) => {
    if (!selectedStudent) return;

    const requestId = ++messagesRequestRef.current;
    setSelectedConversation(conversation);
    setMessages([]);
    setMessagesError(false);
    setMessagesLoading(true);

    try {
      const items = await OrchestratorRestClient.loadStudentBotMessages(
        conversation.hash,
        selectedStudent.username,
      );
      if (requestId === messagesRequestRef.current) setMessages(items);
    } catch (error) {
      console.error("Error loading student bot messages:", error);
      if (requestId === messagesRequestRef.current) setMessagesError(true);
    } finally {
      if (requestId === messagesRequestRef.current) setMessagesLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    if (!username) return;

    void OrchestratorRestClient.getAcquiredTeacherBots(username)
      .then((items) => {
        if (isCurrent) setBots(items);
      })
      .catch((error) => {
        console.error("Error loading teacher bots:", error);
        if (isCurrent) setLoadError(true);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [username]);

  const selectedStudentName = selectedStudent
    ? selectedStudent.displayName?.trim() ||
      [selectedStudent.firstName, selectedStudent.lastname]
        .filter(Boolean)
        .join(" ") ||
      selectedStudent.username
    : "";

  return (
    <section className="bot-management" aria-labelledby="bot-management-title">
      {selectedStudent ? (
        <div className="bot-management__student-view">
          <header className="bot-management__student-view-header">
            <button
              type="button"
              className="bot-management__back-button"
              onClick={handleBackToStudents}
            >
              <ArrowBackIcon className="bot-management__back-icon" />
              <span>{t("teacherDashboard.backToStudents")}</span>
            </button>
            <div className="bot-management__student-view-title">
              <h2>{selectedStudentName}</h2>
              <span>{selectedStudent.username}</span>
            </div>
          </header>

          {conversationsLoading ? (
            <div className="bot-management__state" role="status">
              <CircularProgress size={22} />
              <span>{t("teacherDashboard.loadingConversations")}</span>
            </div>
          ) : conversationsError ? (
            <div
              className="bot-management__state bot-management__state--error"
              role="alert"
            >
              {t("teacherDashboard.loadConversationsError")}
            </div>
          ) : studentConversations.length === 0 ? (
            <div className="bot-management__state">
              {t("teacherDashboard.noConversations")}
            </div>
          ) : (
            <div className="bot-management__chat-layout">
              <nav
                className="bot-management__conversation-list"
                aria-label={t("teacherDashboard.studentConversations")}
              >
                {studentConversations.map((conversation) => (
                  <button
                    type="button"
                    className={`bot-management__conversation${selectedConversation?.hash === conversation.hash ? " is-selected" : ""}`}
                    key={conversation.hash}
                    onClick={() => void handleConversationClick(conversation)}
                  >
                    <strong>
                      {conversation.title ||
                        t("teacherDashboard.untitledConversation")}
                    </strong>
                    <span>
                      {conversation.lastMessage || t("sidebar.noMessages")}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="bot-management__chat-panel">
                {selectedConversation ? (
                  <ChatContainer className="bot-management__chat-container">
                    <ConversationHeader>
                      <UserAvatar name={selectedConversation.title} online />
                      <ConversationHeader.Content
                        userName={
                          selectedConversation.title ||
                          t("teacherDashboard.untitledConversation")
                        }
                        info={selectedStudentName}
                      />
                    </ConversationHeader>
                    <MessageList
                      className="bot-management__message-list"
                      autoScrollToBottom
                    >
                      {messagesLoading ? (
                        <div
                          className="bot-management__chat-state"
                          role="status"
                        >
                          <CircularProgress size={22} />
                          <span>{t("teacherDashboard.loadingMessages")}</span>
                        </div>
                      ) : messagesError ? (
                        <div
                          className="bot-management__chat-state bot-management__state--error"
                          role="alert"
                        >
                          {t("teacherDashboard.loadMessagesError")}
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="bot-management__chat-state">
                          {t("teacherDashboard.noMessages")}
                        </div>
                      ) : (
                        messages.map((message) => {
                          const sentTime = formatMessageTime(message.timestamp);
                          return (
                            <Message
                              key={message.id}
                              model={{
                                message: message.text,
                                sentTime,
                                direction: message.outgoing
                                  ? "outgoing"
                                  : "incoming",
                                position: "single",
                              }}
                            >
                              {!message.outgoing && (
                                <Message.CustomContent>
                                  <MarkdownMessage content={message.text} />
                                </Message.CustomContent>
                              )}
                              {sentTime ? (
                                <Message.Footer sentTime={sentTime} />
                              ) : null}
                            </Message>
                          );
                        })
                      )}
                    </MessageList>
                  </ChatContainer>
                ) : (
                  <div className="bot-management__chat-empty">
                    {t("teacherDashboard.selectConversation")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bot-management__heading">
            <div>
              <h2 id="bot-management-title">
                {t("teacherDashboard.manageBots")}
              </h2>
              <p>{t("teacherDashboard.botCount", { count: bots.length })}</p>
            </div>
          </div>

          {!username || loadError ? (
            <div
              className="bot-management__state bot-management__state--error"
              role="alert"
            >
              {t("teacherDashboard.loadBotsError")}
            </div>
          ) : loading ? (
            <div className="bot-management__state" role="status">
              <CircularProgress size={22} />
              <span>{t("teacherDashboard.loadingBots")}</span>
            </div>
          ) : (
            <div className="bot-management__list" ref={botListRef}>
              {[
                {
                  botID: "bot-echo-7suf",
                  name: "luna-gap",
                  displayName: "لونا",
                  ownerUserName: null,
                  promptCode: "BASE_TEMPLATE",
                  aiModel: "gpt-5.6-luna",
                  scope: "EDUCATION",
                  enabled: true,
                  description: "هوش مصنوعی لونا از مدلهای چت جی پی تی",
                },
                {
                  botID: "bot-flame-r6nn",
                  name: "Arabic-Agentqwen",
                  displayName: "Arabic-Agentqwen",
                  ownerUserName: null,
                  promptCode: "BASE_PROMPT_AMIN",
                  aiModel: "qwen3.8-2.4t-a95b",
                  scope: "",
                  enabled: false,
                  description: "",
                },
              ].map((bot) => (
                <article
                  className={`bot-management__card${selectedBotID === bot.botID ? " is-selected" : ""}`}
                  key={bot.botID}
                >
                  <button
                    type="button"
                    className="bot-management__bot-button"
                    aria-expanded={selectedBotID === bot.botID}
                    onClick={() => void handleBotClick(bot)}
                  >
                    <span className="bot-management__card-heading">
                      <span
                        className="bot-management__bot-icon"
                        aria-hidden="true"
                      >
                        {bot.displayName?.charAt(0) || bot.name.charAt(0)}
                      </span>
                      <span className="bot-management__bot-title">
                        <strong>{bot.displayName || bot.name}</strong>
                        <span>{bot.name}</span>
                      </span>
                      <span
                        className={`bot-management__status${bot.enabled ? " is-enabled" : ""}`}
                      >
                        {bot.enabled
                          ? t("teacherDashboard.enabled")
                          : t("teacherDashboard.disabled")}
                      </span>
                    </span>
                    <span className="bot-management__bot-action">
                      {selectedBotID === bot.botID
                        ? t("teacherDashboard.hideStudents")
                        : t("teacherDashboard.viewStudents")}
                      <ExpandMoreOutlinedIcon
                        className={
                          selectedBotID === bot.botID
                            ? "is-expanded"
                            : undefined
                        }
                        fontSize="small"
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                  {/* {bot.description && (
                    <p className="bot-management__description">
                      {bot.description}
                    </p>
                  )} */}
                  <dl className="bot-management__details">
                    <div>
                      <dt>{t("teacherDashboard.model")}</dt>
                      <dd>{bot.aiModel || "—"}</dd>
                    </div>
                    <div>
                      <dt>{t("teacherDashboard.scope")}</dt>
                      <dd>{bot.scope || "—"}</dd>
                    </div>
                  </dl>
                  {selectedBotID === bot.botID && (
                    <div className="bot-management__participants">
                      <h4>{t("teacherDashboard.students")}</h4>
                      {participantsLoading ? (
                        <div
                          className="bot-management__participants-state"
                          role="status"
                        >
                          <CircularProgress size={18} />
                          <span>{t("teacherDashboard.loadingStudents")}</span>
                        </div>
                      ) : participantsError ? (
                        <div
                          className="bot-management__participants-state bot-management__state--error"
                          role="alert"
                        >
                          {t("teacherDashboard.loadStudentsError")}
                        </div>
                      ) : participants.length === 0 ? (
                        <div className="bot-management__participants-state">
                          {t("teacherDashboard.noStudents")}
                        </div>
                      ) : (
                        <div className="bot-management__students-list">
                          {participants.map((student) => {
                            const displayName =
                              student.displayName?.trim() ||
                              [student.firstName, student.lastname]
                                .filter(Boolean)
                                .join(" ") ||
                              student.username;
                            return (
                              <button
                                type="button"
                                className={`bot-management__student${highlightedStudentUsername === student.username ? " is-selected" : ""}`}
                                key={student.username}
                                onClick={() => void handleStudentClick(student)}
                              >
                                <span className="bot-management__student-avatar">
                                  {displayName.charAt(0)}
                                </span>
                                <span className="bot-management__student-name">
                                  <strong>{displayName}</strong>
                                  <small>{student.username}</small>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
