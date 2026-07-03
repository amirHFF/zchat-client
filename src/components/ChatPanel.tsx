import {
    ChatContainer,
    ConversationHeader,
    Message,
    MessageInput,
    MessageList
} from "@chatscope/chat-ui-kit-react";
import React, { useEffect, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { ChatServiceFacade } from "../xmpp/ChatServiceFacade";
import { useChatStore } from "../chatStore/ChatStore";
import type { ChatMessage } from "../model/ChatMessage";



export default function ChatPanel() {


    const [text, setText] = useState("");

    const messageListRef = useRef<any>(null);

    const chatServiceFacade = ChatServiceFacade.getInstance();

    const conversation = useChatStore(
        state => state.selectedConversation
    );

    const messages = useChatStore(
        state => state.messages
    );

    const addMessage = useChatStore(
        state => state.addMessage
    );
    useEffect(() => {

        if (!conversation) {
            return;
        }

        chatServiceFacade.loadChatHistory(conversation.jid , conversation.id);

    }, [conversation]);

    const handleSend = (value: string) => {

        if (!conversation)
            return;

        if (!value.trim())
            return;

        chatServiceFacade.sendMessage(
            conversation.jid,
            value
        );

    };

    if (!conversation) {

        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%"
                }}
            >
                Select Conversation
            </div>
        );

    }

    return (

        <ChatContainer>

            <ConversationHeader>

                <ConversationHeader.Back />

                <UserAvatar
                    name={conversation.name}
                    online={true}
                />

                <ConversationHeader.Content
                    userName={conversation.name}
                    info="Online"
                />

            </ConversationHeader>

            <MessageList
                ref={messageListRef}
                autoScrollToBottom
            >

                {messages.map(message => (

                    <Message
                        key={message.id}
                        model={{
                            message: message.text,
                            direction:
                                message.outgoing
                                    ? "outgoing"
                                    : "incoming",
                            position: "single"
                        }}
                    />

                ))}

            </MessageList>

            <MessageInput
                placeholder="Type a message..."
                value={text}
                onChange={setText}
                onSend={handleSend}
                attachButton
            />

        </ChatContainer>

    );

}