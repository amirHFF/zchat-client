import {
    ChatContainer,
    ConversationHeader,
    Message,
    MessageInput,
    MessageList
} from "@chatscope/chat-ui-kit-react";

import type { Conversation } from "../model/Conversation";
import { messages } from "../data/messages";
import UserAvatar from "./UserAvatar";
import React, { useRef, useEffect } from "react";
import { XmppServer } from "../xmpp/XmppServer";

interface Props {
    conversation: Conversation;
}

export default function ChatPanel({ conversation }: Props) {

    const currentMessages = messages
        .filter(m => m.conversationId === conversation.id)
        // اگر لازم بود، بر اساس زمان مرتب کن (جدیدترین در آخر)
        .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());

    const messageListRef = useRef<any>(null);

    // خودکار اسکرول به پایین وقتی پیام جدید اضافه می‌شه
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollToBottom();
        }
    }, [currentMessages]);

    function connect(){
      const xmpp =
    XmppServer.getInstance();
  const handleLogin = () => {
    xmpp.login("nafiseh@zchat.ir", "123");
  };
    }

    return (
        <ChatContainer>
            <ConversationHeader>
                <ConversationHeader.Back />
                <UserAvatar name={conversation.name} online={true} />
                <ConversationHeader.Content
                    userName={conversation.name}
                    info="Online"
                />
            </ConversationHeader>

            <MessageList
                ref={messageListRef}
                autoScrollToBottom={true}           // مهم
// style={{ display: 'flex', flexDirection: 'column-reverse' }}
            >
                {currentMessages.map((message) => (
                    <Message
                        key={message.id}
                        model={{
                            message: message.text,
                            direction: message.outgoing ? "outgoing" : "incoming",
                            position: "single",
                        }}
                    />
                ))}
            </MessageList>

            <MessageInput
                placeholder="Type a message..."
                attachButton={true}
                onClick={connect}
            />
        </ChatContainer>
    );
}