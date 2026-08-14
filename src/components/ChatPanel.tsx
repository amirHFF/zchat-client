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
import "./ChatPanel.css";

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

    useEffect(() => {

        if (!conversation) {
            return;
        }

        chatServiceFacade.loadChatHistory(conversation.targetJid, conversation.targetJid);

    }, [conversation]);

    const handleSend = (value: string) => {

        if (!conversation)
            return;

        if (!value.trim())
            return;

        chatServiceFacade.sendMessage(
            conversation.targetJid,
            value
        );

        setText("");
    };

    if (!conversation) {
        return (
            <div className="empty-chat">
                <div className="mark">S</div>
                <div className="title">No conversation selected</div>
                <div className="subtitle">Pick someone from the list to start chatting</div>
            </div>
        );
    }

    return (

        <ChatContainer>

            <ConversationHeader>

                <ConversationHeader.Back />

                <UserAvatar
                    name={conversation.targetJid}
                    online={true}
                />

                <ConversationHeader.Content
                    userName={conversation.targetJid}
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