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
import IconButton from "@mui/material/IconButton";
import { useChatStore } from "../chatStore/ChatStore";
import React, { useEffect, useState } from "react";
import type { ConversationModel } from "../model/ConversationModel";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";
import { formatConversationTime } from "../utils/formatTimestamp";

import "./ConversationListPanel.css";

// module-level: survives StrictMode remount (useRef does not)
let conversationsFetchStarted = false;

export default function ConversationListPanel() {
  const [profileOpen, setProfileOpen] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const setSelectedConversation = useChatStore(
    (state) => state.setSelectedConversation,
  );
  const selectedConversation = useChatStore(
    (state) => state.selectedConversation,
  );
  const setMessages = useChatStore((state) => state.setMessages);

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

        <div className="mark">S</div>
        <div className="title">Simorq</div>
        <span style={{ marginLeft: "auto" }}>vld{_APP_VERSION_}</span>
      </div>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />

      <Search placeholder="Search conversations" />

      <ConversationList>
        {conversations?.length ? (
          conversations.map((conversation) => (
            <Conversation
              key={conversation.hash || conversation.targetJid}
              name={conversation.title || conversation.targetJid}
              info={conversation.lastMessage || "No messages yet"}
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
          ))
        ) : (
          <div className="empty-list">No conversations yet</div>
        )}
      </ConversationList>
    </Sidebar>
  );
}
