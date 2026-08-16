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

                <NewConversation onCreateConversation={async function (username: string): Promise<void> {
                    console.log("converstion will be added " + username);

                    if (username != null) {
                        const currentJid = `${keycloak.tokenParsed?.preferred_username}@zchat.ir`;
                        const chatStore = useChatStore.getState();

                        await OrchestratorRestClient.addConversation([username.concat("@zchat.ir"),
                             currentJid], "");

                        const newConversation: ConversationModel = {
                            jid: currentJid,
                            targetJid: username.concat("@zchat.ir"),
                            lastMessage: "",
                            lastMessageTime: Date.now().toString()
                        }
                        chatStore.addConversation(newConversation);
                        chatStore.setSelectedConversation(newConversation);
                        ChatServiceFacade.getInstance().loadChatHistory(newConversation.targetJid, newConversation.targetJid);
                    }
                }} />

                <MainContainer responsive>
                    <ConversationListPanel />
                    <ChatPanel />
                </MainContainer>

            </div>
        </div>
    );
}