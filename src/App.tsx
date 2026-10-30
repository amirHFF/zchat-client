import "./App.css";
import "./theme.css";
import { useState } from "react";
import { useT } from "./i18n/useT";
import keycloak from "./auth/Keycloak";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatPanel from "./components/ChatPanel";
import { useChatStore } from "./chatStore/ChatStore";
import NewConversation from "./components/NewConversation";
import { MainContainer } from "@chatscope/chat-ui-kit-react";
import { ChatServiceFacade } from "./xmpp/ChatServiceFacade";
import type { ConversationModel } from "./model/ConversationModel";
import { SimorghLoader } from "./components/loading/SimorghLoader";
import ConversationListPanel from "./components/ConversationListPanel";
import { OrchestratorRestClient } from "./restClient/OrchestratorRestClient";

const chatFacade: ChatServiceFacade = ChatServiceFacade.getInstance();
export default function App() {
  const mobileView = useChatStore((state) => state.mobileView);
  const navigate = useNavigate();
  const t = useT();

  const [connected, setConnected] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);

  useEffect(() => {
    async function init() {
      if (!keycloak.authenticated) navigate("/");

      const jid = `${keycloak.tokenParsed?.preferred_username}@zchat.ir`;

      await chatFacade.login(jid, keycloak.token);

      console.log("login done");

      setConnected(true);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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

  if (!connected) {
    return (
      <div className="connecting-screen">
        {/* <div className="connecting-ring"></div> */}
        {/* <div className="connecting-text">{t("app.connecting")}</div> */}
        <SimorghLoader />
        <div className="connecting-sub">{t("app.settingUp")}</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="chat-frame" data-mobile-view={mobileView}>
        <NewConversation
          onCreateConversation={(username) =>
            openCreatedConversation(username, () =>
              OrchestratorRestClient.addConversation(
                [username, keycloak.tokenParsed?.preferred_username ?? ""],
                "",
              ),
            )
          }
          onCreateBotConversation={(botId, botParticipationCode) =>
            openCreatedConversation(botId, () =>
              OrchestratorRestClient.addBotConversation(
                botId,
                keycloak.tokenParsed?.preferred_username ?? "",
                botParticipationCode,
              ),
            )
          }
        />

        <MainContainer responsive>
          <ConversationListPanel />
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
