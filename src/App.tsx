import React, { useEffect } from "react";
import { MainContainer } from "@chatscope/chat-ui-kit-react";
import ConversationListPanel from "./components/ConversationListPanel";
import ChatPanel from "./components/ChatPanel";
import NewConversation from "./components/NewConversation";
import { ChatServiceFacade } from "./xmpp/ChatServiceFacade";
import { useChatStore } from "./chatStore/ChatStore";
import keycloak from "./auth/Keycloak";
import { useState } from "react";
import { OrchestratorRestClient } from "./restClient/OrchestratorRestClient";
import type { ConversationModel } from "./model/ConversationModel";
import "./theme.css";
import "./App.css";
import { useNavigate } from "react-router-dom";


const chatFacade: ChatServiceFacade = ChatServiceFacade.getInstance();
export default function App() {
    const mobileView = useChatStore(state => state.mobileView);
    const navigate = useNavigate();

    const [connected, setConnected] = useState(false);
    const [creatingConversation, setCreatingConversation] = useState(false); // ⬅️ استیت جدید

    useEffect(() => {
        async function init() {
            if (!keycloak.authenticated)
                navigate("/");

            const jid =
                `${keycloak.tokenParsed?.preferred_username}@zchat.ir`;

            await chatFacade.login(
                jid,
                keycloak.token
            );

            console.log("login done");

            setConnected(true);
        }

        init();
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
                const messages = await OrchestratorRestClient.loadConversationMessages(newConversation.hash);
                chatStore.setMessages(messages);
            }
        } finally {
            setCreatingConversation(false);
        }
    }

    if (!connected) {
        return (
            <div className="connecting-screen">
                <div className="connecting-ring"></div>
                <div className="connecting-text">Connecting to Simorq</div>
                <div className="connecting-sub">Setting up your secure session…</div>
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
                        <div className="connecting-ring"></div>
                        <div className="connecting-text">Creating conversation…</div>
                    </div>
                )}

            </div>
        </div>
    );
}