import {
    Sidebar,
    Search,
    ConversationList,
    Conversation
} from "@chatscope/chat-ui-kit-react";
import React, { useEffect, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { useChatStore } from "../chatStore/ChatStore";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";
import keycloak from "../auth/Keycloak";
import type { ConversationModel } from "../model/ConversationModel";
import { ChatServiceFacade } from "../xmpp/ChatServiceFacade";
import ProfileDrawer from "./ProfileDrawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";


import "./ConversationListPanel.css";

export default function ConversationListPanel() {
    const [profileOpen, setProfileOpen] = useState(false);

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
            console.log("load shodan az conversation list panel");
            ChatServiceFacade.getInstance().loadChatHistory(conversation.targetJid, conversation.targetJid);
        }

        setMobileView("chat");
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

                <div className="mark">S</div>
                <div className="title">SimorQ</div>
            </div>

            <ProfileDrawer
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
            />

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