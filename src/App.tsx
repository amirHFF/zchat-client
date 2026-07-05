import React, { useEffect } from "react";
import { MainContainer } from "@chatscope/chat-ui-kit-react";
import ConversationListPanel from "./components/ConversationListPanel";
import ChatPanel from "./components/ChatPanel";
import NewConversation from "./components/NewConversation";
import { ChatServiceFacade } from "./xmpp/ChatServiceFacade";
import { OpenfireClient } from "./restClient/openfireClient";
import { useChatStore } from "./chatStore/ChatStore";
import keycloak from "./auth/Keycloak";
import { useState } from "react";


const chatFacade: ChatServiceFacade = ChatServiceFacade.getInstance();
export const userJid = "nafiseh@zchat.ir";

export default function App() {

    const [connected, setConnected] = useState(false);

    useEffect(() => {

        async function init() {

            if (!keycloak.authenticated)
                return;

            const jid =
                `${keycloak.tokenParsed?.preferred_username}@zchat.ir`;

            await chatFacade.login(
                jid,
                "123"
            );

            console.log("login done");

            setConnected(true);
        }

        init();

    }, []);

    if (!connected) {
        return (
            <div>
                Connecting to Openfire...
            </div>
        );
    }

    return (

        <div
            style={{
                height: "100vh",
                padding: "30px",
                background:
                    "linear-gradient(135deg,#c8d5ff 0%,#b8b6ff 100%)",
                boxSizing: "border-box",
            }}
        >

            <div
                style={{
                    height: "100%",
                    borderRadius: "18px",
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                }}
            >
                <NewConversation onCreateConversation={function (username: string): void {
                    let jid = OpenfireClient.fetchUserName(username);

                    if (!jid) {

                        useChatStore.getState().addConversation({
                            id: 1,
                            name: username,
                            jid: username + "@zchat.ir",
                            lastMessage: ""
                        })
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