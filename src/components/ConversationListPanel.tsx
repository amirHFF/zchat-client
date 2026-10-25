import {
  Sidebar,
  Search,
  ConversationList,
  Conversation,
} from "@chatscope/chat-ui-kit-react";
import keycloak from "../auth/Keycloak";
import UserAvatar from "./UserAvatar";
import ProfileDrawer from "./ProfileDrawer";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import IconButton from "@mui/material/IconButton";
import { useChatStore } from "../chatStore/ChatStore";
import React, { useEffect, useState } from "react";
import type { ConversationModel } from "../model/ConversationModel";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";
import { formatConversationTime } from "../utils/formatTimestamp";
import LanguageSwitch from "./LanguageSwitch";
import { useT } from "../i18n/useT";
import "./ConversationListPanel.css";
import { SimorghIcon } from "../assets/icon/SimorghIcon";
import { isBotConversation, getBotId } from "../utils/botConversation";

// module-level: survives StrictMode remount (useRef does not)
let conversationsFetchStarted = false;

export default function ConversationListPanel() {
  const [profileOpen, setProfileOpen] = useState(false);
  const t = useT();

  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const setSelectedConversation = useChatStore(
    (state) => state.setSelectedConversation,
  );
  const selectedConversation = useChatStore(
    (state) => state.selectedConversation,
  );
  const setMessages = useChatStore((state) => state.setMessages);
  const subConversations = useChatStore((state) => state.subConversations);
  const setSubConversations = useChatStore(
    (state) => state.setSubConversations,
  );
  const addSubConversationToStore = useChatStore(
    (state) => state.addSubConversation,
  );
  const [expandedBots, setExpandedBots] = useState<Record<string, boolean>>({});
  const [loadingBots, setLoadingBots] = useState<Record<string, boolean>>({});
  const [creatingFor, setCreatingFor] = useState<string | null>(null);

  const isActive = (conversation: ConversationModel) => {
    if (!selectedConversation) return false;

    // اگر هر دو hash دارند، فقط با hash مقایسه کن
    if (selectedConversation.hash && conversation.hash) {
      return selectedConversation.hash === conversation.hash;
    }

    // در غیر این صورت (گفت‌وگوی جدید بدون hash) با targetJid
    return (
      !selectedConversation.hash &&
      !conversation.hash &&
      selectedConversation.targetJid === conversation.targetJid
    );
  };
  useEffect(() => {
    const loadConversations = async () => {
      if (conversationsFetchStarted) return;

      const username = keycloak.tokenParsed?.preferred_username;
      if (!username) return;

      conversationsFetchStarted = true; // lock before await

      const fetched = await OrchestratorRestClient.fetchConversations(username);

      if (fetched !== undefined) {
        setConversations(fetched);
      }
    };

    loadConversations();
  }, [setConversations]);

  const setMobileView = useChatStore((state) => state.setMobileView);
  const selectSubConversation = async (
    conversation: ConversationModel,
    loadMessages: boolean,
  ) => {
    const selected = {
      ...conversation,
      targetJid: getBotId(conversation) ?? conversation.targetJid,
    };
    setSelectedConversation(selected);
    setMessages([]);
    setMobileView("chat");
    if (!loadMessages || !conversation.hash) return;
    const messages = await OrchestratorRestClient.loadConversationMessages(
      conversation.hash,
    );
    if (
      useChatStore.getState().selectedConversation?.hash === conversation.hash
    )
      setMessages(messages);
  };

  const toggleBot = async (conversation: ConversationModel) => {
    const parentHash = conversation.hash;
    const expand = !expandedBots[parentHash];
    setExpandedBots((state) => ({ ...state, [parentHash]: expand }));
    if (
      !expand ||
      Object.prototype.hasOwnProperty.call(subConversations, parentHash)
    )
      return;
    setLoadingBots((state) => ({ ...state, [parentHash]: true }));
    const items =
      await OrchestratorRestClient.fetchSubConversations(parentHash);
    setSubConversations(parentHash, items);
    setLoadingBots((state) => ({ ...state, [parentHash]: false }));
  };

  const createSubConversation = async (parentHash: string) => {
    const title = window.prompt(t("sidebar.enterChatTitle"))?.trim();
    if (!title) return;
    setCreatingFor(parentHash);
    try {
      const item = await OrchestratorRestClient.addSubConversation(
        parentHash,
        title,
      );
      addSubConversationToStore(parentHash, item);
      await selectSubConversation(item, false);
    } catch (error) {
      console.error("Error creating sub-conversation:", error);
      window.alert(String(error));
    } finally {
      setCreatingFor(null);
    }
  };
  const handleSelect = async (conversation: ConversationModel) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setMobileView("chat");

    if (!conversation.hash) {
      console.error(
        "Cannot load messages: conversation.hash is empty",
        conversation,
      );
      return;
    }

    const messages = await OrchestratorRestClient.loadConversationMessages(
      conversation.hash,
    );

    // Ignore stale response if user already clicked another conversation
    if (
      useChatStore.getState().selectedConversation?.hash === conversation.hash
    ) {
      setMessages(messages);
    }
  };
  return (
    <Sidebar position="left" className="conversation-sidebar">
      <div className="sidebar-header">
        <IconButton
          onClick={() => setProfileOpen(true)}
          sx={{ color: "var(--navy)" }}
        >
          <MenuIcon />
        </IconButton>

        {/* <div className="mark" aria-label="Simorq">
          <span className="mark-monogram">S</span>
        </div> */}
        <div className="mark" aria-label="Simorq">
          <span className="mark-monogram">
            <SimorghIcon />
          </span>
        </div>
        <div className="title">{t("brand.name")}</div>
        <LanguageSwitch className="sidebar-lang-switch" />
        <span className="app-version">vld{_APP_VERSION_}</span>
      </div>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />

      <Search placeholder={t("sidebar.search")} />

      <ConversationList>
        {conversations?.length ? (
          conversations.map((conversation) =>
            isBotConversation(conversation) ? (
              <React.Fragment key={conversation.hash || conversation.targetJid}>
                <Conversation
                  className={`bot-conversation${selectedConversation?.parentHash === conversation.hash ? " bot-parent-active" : ""}`}
                  name={
                    <>
                      <span className="bot-expand-icon" aria-hidden="true">
                        {expandedBots[conversation.hash] ? (
                          <KeyboardArrowDownIcon fontSize="small" />
                        ) : (
                          <KeyboardArrowRightIcon fontSize="small" />
                        )}
                      </span>
                      <span className="bot-conversation-name">
                        {conversation.title || conversation.targetJid}
                      </span>
                    </>
                  }
                  info={conversation.lastMessage || t("sidebar.noMessages")}
                  active={
                    selectedConversation?.hash === conversation.hash ||
                    Boolean(
                      selectedConversation?.parentHash === conversation.hash,
                    )
                  }
                  onClick={() => void toggleBot(conversation)}
                >
                  <UserAvatar name={conversation.title} online={true} />
                </Conversation>
                {expandedBots[conversation.hash] && (
                  <div className="bot-sub-list">
                    <button
                      className="bot-sub-create"
                      disabled={creatingFor === conversation.hash}
                      onClick={() =>
                        void createSubConversation(conversation.hash)
                      }
                    >
                      <AddIcon fontSize="small" /> {t("sidebar.newChat")}
                    </button>
                    {loadingBots[conversation.hash] ? (
                      <div className="bot-sub-empty">
                        {t("sidebar.loadingChats")}
                      </div>
                    ) : null}
                    {!loadingBots[conversation.hash] &&
                    !subConversations[conversation.hash]?.length ? (
                      <div className="bot-sub-empty">
                        {t("sidebar.noSubConversations")}
                      </div>
                    ) : null}
                    {subConversations[conversation.hash]?.map((sub) => (
                      <button
                        key={sub.hash}
                        className={`bot-sub-item${selectedConversation?.hash === sub.hash ? " active" : ""}`}
                        onClick={() => void selectSubConversation(sub, true)}
                      >
                        <span className="bot-sub-title">
                          {sub.title || t("sidebar.newChat")}
                        </span>
                        <span className="bot-sub-message">
                          {(sub.lastMessage || "")
                            .replaceAll("#", "")
                            .replaceAll("*", "")
                            .replaceAll("_", "")
                            .replaceAll("`", "")
                            .replaceAll("~", "")
                            .replaceAll(">", "")
                            .replaceAll("[", "")
                            .replaceAll("]", "")
                            .replaceAll("(", "")
                            .replaceAll(")", "")
                            .replaceAll("!", "")
                            .replaceAll("|", "")
                            .replace(/\s+/g, " ")
                            .trim() || t("sidebar.noMessages")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ) : (
              <Conversation
                key={conversation.hash || conversation.targetJid}
                name={conversation.title || conversation.targetJid}
                info={conversation.lastMessage || t("sidebar.noMessages")}
                /* last message time from lastMessageTime / timeStamp */
                lastActivityTime={formatConversationTime(
                  conversation.lastMessageTime,
                )}
                active={
                  selectedConversation?.hash
                    ? selectedConversation.hash === conversation.hash
                    : selectedConversation?.targetJid === conversation.targetJid
                }
                onClick={() => handleSelect(conversation)}
              >
                <UserAvatar name={conversation.title} online={true} />
              </Conversation>
            ),
          )
        ) : (
          <div className="empty-list">{t("sidebar.noConversations")}</div>
        )}
      </ConversationList>
    </Sidebar>
  );
}
