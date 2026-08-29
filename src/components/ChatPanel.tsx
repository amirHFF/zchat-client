import {
    ChatContainer,
    ConversationHeader,
    Message,
    MessageInput,
    MessageList,
    TypingIndicator
} from "@chatscope/chat-ui-kit-react";
import React, { useEffect, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { ChatServiceFacade } from "../xmpp/ChatServiceFacade";
import { useChatStore } from "../chatStore/ChatStore";
import "./ChatPanel.css";

export default function ChatPanel() {
    const setMobileView = useChatStore(state => state.setMobileView);

    const [text, setText] = useState("");
    const [isWaitingForReply, setIsWaitingForReply] = useState(false);

    const messageListRef = useRef<any>(null);
    const chatPanelRef = useRef<HTMLDivElement>(null);
    const chatServiceFacade = ChatServiceFacade.getInstance();

    const conversation = useChatStore(
        state => state.selectedConversation
    );

    const messages = useChatStore(
        state => state.messages
    );

    // --- فیکس مشکل ۱: جلوگیری از پیست شدن استایل/رنگ داخل input ---
    useEffect(() => {
        const editor = chatPanelRef.current?.querySelector<HTMLDivElement>(
            ".cs-message-input__content-editor"
        );

        if (!editor) return;

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            const plainText = e.clipboardData?.getData("text/plain") ?? "";
            // execCommand دیپریکیت شده ولی برای insert کردن متن ساده
            // داخل contentEditable هنوز پشتیبانی می‌شه و undo history رو هم حفظ می‌کنه
            document.execCommand("insertText", false, plainText);
        };

        editor.addEventListener("paste", handlePaste);

        return () => {
            editor.removeEventListener("paste", handlePaste);
        };
    }, [conversation]); // اگه کانورسیشن عوض بشه، editor از نو mount می‌شه

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.outgoing) {
            setIsWaitingForReply(false);
        }
    }, [messages]);

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
        setIsWaitingForReply(true);
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

        <div ref={chatPanelRef} style={{ height: "100%" }}>
            <ChatContainer>

                <ConversationHeader>

                    <ConversationHeader.Back onClick={() => setMobileView("list")} />

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
                    typingIndicator={
                        isWaitingForReply
                            ? <TypingIndicator content="در حال تایپ..." />
                            : undefined
                    }
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
        </div>

    );

}