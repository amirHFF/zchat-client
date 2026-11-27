import "./App.css";
import "./theme.css";
import { useState } from "react";
import { useT } from "./i18n/useT";
import keycloak from "./auth/Keycloak";
import React, { useEffect } from "react";
import ChatPanel from "./components/ChatPanel";
import { useChatStore } from "./chatStore/ChatStore";
import { useLocation, useNavigate } from "react-router-dom";
import NewConversation, {
  type NewConversationTab,
} from "./components/NewConversation";
import { MainContainer } from "@chatscope/chat-ui-kit-react";
import { ChatServiceFacade } from "./xmpp/ChatServiceFacade";
import type { ConversationModel } from "./model/ConversationModel";
import { SimorghLoader } from "./components/loading/SimorghLoader";
import ConversationListPanel from "./components/ConversationListPanel";
import { OrchestratorRestClient } from "./restClient/OrchestratorRestClient";
import {
  enterMobileChatHistory,
  isMobileChatHistoryEntry,
} from "./utils/mobileChatHistory";

const chatFacade: ChatServiceFacade = ChatServiceFacade.getInstance();
const DEV_PREVIEW = import.meta.env.VITE_DEV_PREVIEW === "true";
// App effects run twice in React StrictMode during development. Share the
// connection attempt so Strophe.connect() is never started in parallel.
let chatLoginPromise: Promise<void> | undefined;
export default function App() {
  const mobileView = useChatStore((state) => state.mobileView);
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  const [connected, setConnected] = useState(DEV_PREVIEW);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [loginAttempt, setLoginAttempt] = useState(0);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [newConversationTab, setNewConversationTab] =
    useState<NewConversationTab>(0);
  // Parent hash of a bot that was just added; the sidebar asks for its first chat.
  const [newChatForBot, setNewChatForBot] = useState<string | null>(null);

  function openNewConversation(tab: NewConversationTab) {
    setNewConversationTab(tab);
    setNewConversationOpen(true);
  }

  useEffect(() => {
    async function init() {
      if (DEV_PREVIEW) return;
      if (!keycloak.authenticated) {
        navigate("/");
        return;
      }

      const jid = `${keycloak.tokenParsed?.preferred_username}@zchat.ir`;
      const loginPromise =
        chatLoginPromise ??
        (chatLoginPromise = chatFacade.login(jid, keycloak.token, async () => {
          // The Keycloak access token used as the XMPP password can expire while
          // a mobile browser is suspended; refresh it only when reconnecting.
          await keycloak.updateToken(30);
          return keycloak.token;
        }));

      try {
        await loginPromise;
        console.log("login done");
        setConnectionError(null);
        setConnected(true);
      } catch (error) {
        // Clear only this failed attempt. A later retry can create a fresh one.
        if (chatLoginPromise === loginPromise) chatLoginPromise = undefined;
        console.error("XMPP login failed:", error);
        setConnectionError(String(error));
      }
    }

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginAttempt]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 640px)").matches) return;

    // Keep the mobile pane in sync for Back and Forward browser navigation.
    useChatStore
      .getState()
      .setMobileView(
        isMobileChatHistoryEntry(location.state) ? "chat" : "list",
      );
  }, [location.key, location.state]);
  //create conversation bot with bot id and bot participation code
  async function openCreatedConversation(
    targetJid: string,
    create: () => Promise<{ hash: string; title: string }>,
  ) {
    setCreatingConversation(true);
    try {
      const currentJid = keycloak.tokenParsed?.preferred_username;
      const chatStore = useChatStore.getState();
      const addedConversation = await create();

      enterMobileChatHistory(
        navigate,
        location.pathname,
        location.search,
        location.hash,
        location.state,
      );

      const newConversation: ConversationModel = {
        hash: addedConversation.hash,
        jid: currentJid,
        targetJid,
        title: addedConversation.title,
        lastMessage: "",
        lastMessageTime: Date.now().toString(),
      };
      chatStore.addConversation(newConversation);
      chatStore.setSelectedConversation(newConversation);
      chatStore.setMessages([]);
      chatStore.setMobileView("chat");
      if (newConversation.hash) {
        const messages = await OrchestratorRestClient.loadConversationMessages(
          newConversation.hash,
        );
        chatStore.setMessages(messages);
      }
    } finally {
      setCreatingConversation(false);
    }
  }

  // After a bot is added, do not open the bot itself as a chat: messages sent
  // there are not saved in any conversation. Add the bot to the list and let
  // the sidebar ask for a new chat with its existing "New chat" flow.
  async function addCreatedBot(botId: string, botParticipationCode: string) {
    setCreatingConversation(true);
    try {
      const currentJid = keycloak.tokenParsed?.preferred_username;
      const added = await OrchestratorRestClient.addBotConversation(
        botId,
        currentJid ?? "",
        botParticipationCode,
      );
      const chatStore = useChatStore.getState();
      chatStore.addConversation({
        hash: added.hash,
        jid: currentJid,
        targetJid: botId,
        title: added.title,
        lastMessage: "",
        lastMessageTime: Date.now().toString(),
      });
      // If the bot was already in the list, use the entry that is there.
      const parent = useChatStore
        .getState()
        .conversations.find(
          (c) => (added.hash && c.hash === added.hash) || c.targetJid === botId,
        );
      if (parent?.hash) setNewChatForBot(parent.hash);
    } finally {
      setCreatingConversation(false);
    }
  }

  if (!connected) {
    return (
      <div className="connecting-screen">
        {/* <div className="connecting-ring"></div> */}
        {/* <div className="connecting-text">{t("app.connecting")}</div> */}
        <SimorghLoader />
        <div className="connecting-sub">
          {connectionError ?? t("app.settingUp")}
        </div>
        {connectionError ? (
          <button
            type="button"
            onClick={() => setLoginAttempt((value) => value + 1)}
          >
            Retry connection
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="chat-frame" data-mobile-view={mobileView}>
        <NewConversation
          open={newConversationOpen}
          initialTab={newConversationTab}
          onClose={() => setNewConversationOpen(false)}
          onCreateConversation={(username) =>
            openCreatedConversation(username, () =>
              OrchestratorRestClient.addConversation(
                [username, keycloak.tokenParsed?.preferred_username ?? ""],
                "",
              ),
            )
          }
          onCreateBotConversation={(botId, botParticipationCode) =>
            addCreatedBot(botId, botParticipationCode)
          }
        />

        <MainContainer responsive>
          <ConversationListPanel
            onNewConversation={openNewConversation}
            newChatForBot={newChatForBot}
            onNewChatForBotHandled={() => setNewChatForBot(null)}
          />
          <ChatPanel />
        </MainContainer>

        {creatingConversation && ( // ⬅️ اورلی لودینگ
          <div className="creating-conversation-overlay">
            {/* <div className="connecting-ring"></div>
            <div className="connecting-text">
                
              {t("app.creatingConversation")}
            </div> */}
            <SimorghLoader label={t("app.creatingConversation")} showLabel />
          </div>
        )}
      </div>
    </div>
  );
}
