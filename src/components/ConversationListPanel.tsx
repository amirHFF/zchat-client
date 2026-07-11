import {
    Sidebar,
    Search,
    ConversationList,
    Conversation
} from "@chatscope/chat-ui-kit-react";
import React, { useEffect, useRef } from "react";
import UserAvatar from "./UserAvatar";
import { useChatStore } from "../chatStore/ChatStore";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";
import keycloak from "../auth/Keycloak";
import type { ConversationModel } from "../model/ConversationModel";
import { ChatServiceFacade } from "../xmpp/ChatServiceFacade";

export default function ConversationListPanel() {
    const conversations = useChatStore(state => state.conversations);
    const addConversation = useChatStore(state => state.addConversation);
    const setConversations = useChatStore(state => state.setConversations); // ← بهتره این رو داشته باشی
    const setSelectedConversation = useChatStore(state => state.setSelectedConversation);
    const selectedConversation = useChatStore(state => state.selectedConversation);

    const hasLoaded = useRef(false); // جلوگیری از دو بار لود در StrictMode

    useEffect(() => {
        const loadConversations = async () => {
            if (hasLoaded.current) return;

            const username = keycloak.tokenParsed?.preferred_username;
            if (!username) return;

            const fetched = await OrchestratorRestClient.fetchConversations(username);

            console.log("fetched size : " + fetched)
            setConversations(fetched);                    // ← مهم

            if (fetched.length > 0) {
                setSelectedConversation(fetched[0]);
            }

            console.log("conversations chatstore size " + conversations.length)
            hasLoaded.current = true;
        };

        loadConversations();
    }, [setConversations, setSelectedConversation]);

    const handleSelect = (conversation: ConversationModel) => {
        if (!selectedConversation.targetJid.includes(conversation.targetJid)) {

            setSelectedConversation(conversation);

            ChatServiceFacade.getInstance().loadChatHistory(conversation.targetJid, conversation.targetJid);
        }
    };

    return (
        <Sidebar
            position="left"
            style={{ width: 380, background: "#ffffff" }}
        >
            <Search placeholder="Search..." />

            <ConversationList>
                {conversations.map((conversation) => (
                    <Conversation
                        key={conversation.targetJid}                    // خیلی مهم!
                        name={conversation.targetJid}
                        info={conversation.lastMessage || "No messages yet"}
                        active={selectedConversation?.jid === conversation.jid}
                        onClick={() => handleSelect(conversation)}
                    >
                        <UserAvatar
                            name={conversation.targetJid}
                            online={true}
                        />
                    </Conversation>
                ))}
            </ConversationList>
        </Sidebar>
    );
}