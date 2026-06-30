import {
    Sidebar,
    Search,
    ConversationList,
    Conversation
} from "@chatscope/chat-ui-kit-react";

import React, { useEffect } from "react";

import UserAvatar from "./UserAvatar";

import { conversations } from "../data/conversations";
import { messages } from "../data/messages";

import { useChatStore } from "../chatStore/ChatStore";

export default function ConversationListPanel() {

    const addConversation = useChatStore(
        state => state.addConversation
    );

    const setSelectedConversation = useChatStore(
        state => state.setSelectedConversation
    );

    const setMessages = useChatStore(
        state => state.setMessages
    );

    const selectedConversation = useChatStore(
        state => state.selectedConversation
    );

    useEffect(() => {

        conversations.forEach(addConversation);

        if (conversations.length > 0) {

            setSelectedConversation(conversations[0]);

            setMessages(
                messages.filter(
                    m => m.conversationId === conversations[0].id
                )
            );

        }

    }, []);

    const handleSelect = (conversation: typeof conversations[number]) => {

        setSelectedConversation(conversation);

        setMessages(

            messages.filter(

                m => m.conversationId === conversation.id

            )

        );

    };

    return (

        <Sidebar
            position="left"
            style={{
                width: 380,
                background: "#ffffff",
            }}
        >

            <Search placeholder="Search..." />

            <ConversationList>

                {conversations.map((conversation) => (

                    <Conversation

                        key={conversation.id}

                        name={conversation.name}

                        info={conversation.lastMessage}

                        active={
                            selectedConversation?.id === conversation.id
                        }

                        onClick={() => handleSelect(conversation)}

                    >

                        <UserAvatar

                            name={conversation.name}

                            online={true}

                        />

                    </Conversation>

                ))}

            </ConversationList>

        </Sidebar>

    );

}