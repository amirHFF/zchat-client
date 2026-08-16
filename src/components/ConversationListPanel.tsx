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

import "./ConversationListPanel.css";

export default function ConversationListPanel() {
    const conversations = useChatStore(state => state.conversations);
    const setConversations = useChatStore(state => state.setConversations);
    const setSelectedConversation = useChatStore(state => state.setSelectedConversation);
    const selectedConversation = useChatStore(state => state.selectedConversation);

    const hasLoaded = useRef(false); // جلوگیری از دو بار لود در StrictMode

    useEffect(() => {
        const loadConversations = async () => {
            if (hasLoaded.current) return;

            const username = keycloak.tokenParsed?.preferred_username;
            if (!username) return;

            const fetched = await OrchestratorRestClient.fetchConversations(username);

            if (fetched !== undefined) {
                setConversations(fetched);

                if (fetched.length > 0) {
                    setSelectedConversation(fetched[0]);
                }
            }

            hasLoaded.current = true;
        };

        loadConversations();
    }, [setConversations, setSelectedConversation]);

const setMobileView = useChatStore(state => state.setMobileView);

const handleSelect = (conversation: ConversationModel) => {
    if (
        selectedConversation === undefined ||
        !selectedConversation.targetJid.includes(conversation.targetJid)
    ) {
        setSelectedConversation(conversation);
        ChatServiceFacade.getInstance().loadChatHistory(conversation.targetJid, conversation.targetJid);
    }

    setMobileView("chat");
};

    return (
        <Sidebar position="left" className="conversation-sidebar">

            <div className="sidebar-header">
                <div className="mark">S</div>
                <div className="title">Simorq</div>
            </div>

            <Search placeholder="Search conversations" />

            <ConversationList>
                {conversations?.length ? (
                    conversations.map((conversation) => (
                        <Conversation
                            key={conversation.targetJid}
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
                    ))
                ) : (
                    <div className="empty-list">No conversations yet</div>
                )}
            </ConversationList>

        </Sidebar>
    );
}