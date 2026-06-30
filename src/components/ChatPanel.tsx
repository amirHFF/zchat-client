import {
    ChatContainer,
    ConversationHeader,
    Message,
    MessageInput,
    MessageList
} from "@chatscope/chat-ui-kit-react";

import React, { useEffect, useRef, useState } from "react";

import UserAvatar from "./UserAvatar";

import { XmppServer } from "../xmpp/XmppServer";

import { useChatStore } from "../chatStore/ChatStore";

import type { ChatMessage } from "../model/ChatMessage";

async function  connect() {

    const xmpp = XmppServer.getInstance();

    await xmpp.login(
        "nafiseh@zchat.ir",
        "123"
    );
const features =
    await xmpp.discoverFeatures();

console.log(features);

console.log(
    "MAM:",
    await xmpp.isMamSupported()
);

}

export default function ChatPanel() {
    

    const [text, setText] = useState("");

    const messageListRef = useRef<any>(null);

    const xmpp = XmppServer.getInstance();

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

        connect();

        const unsubscribe =
            xmpp.addMessageListener(xmppMessage => {

                if (!conversation)
                    return;
                
                    console.log("set message to chat panel");

                const message: ChatMessage = {

                    id: Date.now(),

                    conversationId: conversation.id,

                    text: xmppMessage.body,

                    outgoing: false,

                    timestamp: Date.now()

                };

                addMessage(message);

            });

        return () => unsubscribe();

    }, [conversation]);

    const handleSend = (value: string) => {

        if (!conversation)
            return;

        if (!value.trim())
            return;

        xmpp.sendMessage(
            conversation.jid,
            value
        );

        const message: ChatMessage = {

            id: Date.now(),

            conversationId: conversation.id,

            text: value,

            outgoing: true,

            timestamp: Date.now()

        };

        addMessage(message);

        setText("");

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