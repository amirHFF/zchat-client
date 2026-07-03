import type { Message } from "stanza/protocol";
import { useChatStore } from "../chatStore/ChatStore";
import type { ChatMessage } from "../model/ChatMessage";

export class MessageEventHandler {

    public onIncomingMessage(receivedMessage: Message) {
        const state = useChatStore.getState();

        console.log("incoming message:", receivedMessage);

        // بررسی اولیه
        if (!receivedMessage.from || !receivedMessage.body?.trim()) {
            console.warn("Invalid incoming message:", receivedMessage);
            return;
        }

        const conversation = state.conversations.find(
            c => c.jid === receivedMessage.from
        );

        if (!conversation) {
            console.warn(`Conversation not found for jid: ${receivedMessage.from}`);
            return;
        }

        const message: ChatMessage = {
            id: Date.now().toString(),
            conversationId: conversation.id,
            text: receivedMessage.body,
            outgoing: false,
            timestamp: Date.now()
        };

        state.addMessage(message);
    }

    public onOutgoingMessage(
        toJid: string,
        body: string
    ): void {

        const state = useChatStore.getState();

        const conversation =
            state.conversations.find(
                c => c.jid === toJid
            );

        if (!conversation) {
            return;
        }

        const message: ChatMessage = {

            id: Date.now().toString(),

            conversationId: conversation.id,

            text: body,

            outgoing: true,

            timestamp: Date.now()

        };

        state.addMessage(message);


    }

    public onPresenceChanged(
        jid: string,
        online: boolean
    ): void {

        const state = useChatStore.getState();

    }

    public onHistoryLoaded(messages: ChatMessage[]) {
        const state = useChatStore.getState();

        state.setMessages(messages);
    }

}