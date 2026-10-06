import "./ChatPanel.css";
import {
  ChatContainer,
  ConversationHeader,
  Message,
  MessageInput,
  MessageList,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import UserAvatar from "./UserAvatar";
import { useChatStore } from "../chatStore/ChatStore";
import React, { useEffect, useRef, useState } from "react";
import { ChatServiceFacade } from "../xmpp/ChatServiceFacade";
import { formatMessageTime } from "../utils/formatTimestamp";

export default function ChatPanel() {
  const setMobileView = useChatStore((state) => state.setMobileView);

  const [text, setText] = useState("");

  const messageListRef = useRef<HTMLDivElement | null>(null);
  const chatPanelRef = useRef<HTMLDivElement | null>(null);
  const chatServiceFacade = ChatServiceFacade.getInstance();

  const conversation = useChatStore((state) => state.selectedConversation);

  const messages = useChatStore((state) => state.messages);

  // --- فیکس مشکل ۱: جلوگیری از پیست شدن استایل/رنگ داخل input ---
  useEffect(() => {
    const editor = chatPanelRef.current?.querySelector<HTMLDivElement>(
      ".cs-message-input__content-editor",
    );

    if (!editor) return;

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const plainText = e.clipboardData?.getData("text/plain") ?? "";
      // execCommand دیپریکیت شده ولی برای insert کردن متن ساده
      // داخل contentEditable هنوز پشتیبانی می‌شه و undo history رو هم حفظ می‌کنه

      document.execCommand("insertText", false, plainText);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - execCommand is not typed
    };

    editor.addEventListener("paste", handlePaste);

    return () => {
      editor.removeEventListener("paste", handlePaste);
    };
  }, [conversation]); // اگه کانورسیشن عوض بشه، editor از نو mount می‌شه

  const lastMessage = messages[messages.length - 1];
  const isWaitingForReply = Boolean(lastMessage?.outgoing);

  const handleSend = (value: string) => {
    if (!conversation) return;

    if (!value.trim()) return;

    chatServiceFacade.sendMessage(conversation.targetJid, value);

    setText("");
  };

  if (!conversation) {
    return (
      <div className="empty-chat chat-panel-root">
        <div className="mark">S</div>
        <div className="title">No conversation selected</div>
        <div className="subtitle">
          Pick someone from the list to start chatting
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chatPanelRef}
      className="chat-panel-root"
      style={{ height: "100%", width: "100%" }}
    >
      <ChatContainer>
        <ConversationHeader>
          <ConversationHeader.Back onClick={() => setMobileView("list")} />

          <UserAvatar name={conversation.targetJid} online={true} />

          <ConversationHeader.Content
            userName={conversation.targetJid}
            info="Online"
          />
        </ConversationHeader>

        <MessageList
          ref={messageListRef}
          autoScrollToBottom
          typingIndicator={
            isWaitingForReply ? (
              <TypingIndicator content="در حال تایپ..." />
            ) : undefined
          }
        >
          {messages.map((message) => {
            // timeStamp from server, shown under each bubble
            const sentTime = formatMessageTime(message.timestamp);

            return (
              <Message
                key={message.id}
                model={{
                  message: message.text,
                  sentTime,
                  direction: message.outgoing ? "outgoing" : "incoming",
                  position: "single",
                }}
              >
                {sentTime ? <Message.Footer sentTime={sentTime} /> : null}
              </Message>
            );
          })}
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
