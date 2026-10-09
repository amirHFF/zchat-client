import { useChatStore } from "../chatStore/ChatStore";
import type { ChatMessage } from "../model/ChatMessage";
import type { ConversationModel } from "../model/ConversationModel";
import type { XmppMessage } from "../model/XmppMessage";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";

export class MessageEventHandler {

    public onIncomingMessage(receivedMessage: XmppMessage) {
        const state = useChatStore.getState();

        console.log("incoming message:", receivedMessage);

        // بررسی اولیه
        if (!receivedMessage.from || !receivedMessage.body?.trim()) {
            console.warn("Invalid incoming message:", receivedMessage);
            return;
        }

        if (!state.selectedConversation) {
            console.warn(`Conversation not found for jid: ${receivedMessage.from}`);
            return;
        }
        // if (state.selectedConversation.targetJid.concat("@zchat.ir") == receivedMessage.from) {
        const newConversation: ConversationModel = {
            hash: receivedMessage.hash,
            jid: state.selectedConversation.jid,
            targetJid: receivedMessage.from,
            title: receivedMessage.from,
            lastMessage: receivedMessage.body,
            lastMessageTime: Date.now().toString()
        }

        if (!state.conversations.find((conv) => conv.hash !== newConversation.hash)) {

            OrchestratorRestClient.addConversation([receivedMessage.from, state.selectedConversation.jid], receivedMessage.body);

            state.addConversation(newConversation)
        }
        // }
        if (state.selectedConversation.targetJid.concat("@zchat.ir") == receivedMessage.from) {
            const message: ChatMessage = {
                id: receivedMessage.id,
                conversationId: state.selectedConversation.hash || state.selectedConversation.targetJid,
                text: receivedMessage.body,
                outgoing: false,
                timestamp: Date.now()
            };

            state.addMessage(message);
        }
    }

    public onOutgoingMessage(
        _toJid: string,
        body: string
    ): void {

        const state = useChatStore.getState();

        const message: ChatMessage = {

            id: crypto.randomUUID(),

            conversationId: state.selectedConversation?.hash || state.selectedConversation?.jid,

            text: body,

            outgoing: true,

            timestamp: Date.now()

        };

        state.addMessage(message);


    }

    public onPresenceChanged(
        _jid: string,
        _online: boolean
    ): void {

        useChatStore.getState();

    }

    public onHistoryLoaded(messages: ChatMessage[]) {
        const state = useChatStore.getState();

        state.setMessages(messages);
    }

}