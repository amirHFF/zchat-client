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
                keycloak.token
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
                <NewConversation onCreateConversation={async function (username: string): Promise<void> {
                    console.log("converstion will be added " +username);
            
                    if (username!=null) {
                        const currentJid = `${keycloak.tokenParsed?.preferred_username}@zchat.ir`;
                        const chatStore = useChatStore.getState();

                        const conversations = await OrchestratorRestClient.addConversation([username.concat("@zchat.ir"),
                             currentJid] , "");

                        const newConversation:ConversationModel={
                            jid:currentJid,
                            targetJid:username.concat("@zchat.ir"),
                            lastMessage:"",
                            lastMessageTime:Date.now().toString()
                        }    
                        chatStore.addConversation(newConversation);
                        chatStore.setSelectedConversation(newConversation);
                        ChatServiceFacade.getInstance().loadChatHistory(newConversation.targetJid , newConversation.targetJid);

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