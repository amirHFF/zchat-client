import { create } from "zustand";

import type { Conversation } from "../model/Conversation";
import type { XmppMessage } from "../model/XmppMessage";

export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected";

interface ChatStore {

    conversations: Conversation[];

    selectedConversation?: Conversation;

    messages: XmppMessage[];

    connectionStatus: ConnectionStatus;

    addConversation(
        conversation: Conversation
    ): void;

    setSelectedConversation(
        conversation: Conversation
    ): void;

    setMessages(
        messages: XmppMessage[]
    ): void;

    addMessage(
        message: XmppMessage
    ): void;

    clearMessages(): void;

    setConnectionStatus(
        status: ConnectionStatus
    ): void;
}

export const useChatStore = create<ChatStore>((set) => ({

    conversations: [],

    selectedConversation: undefined,

    messages: [],

    connectionStatus: "disconnected",

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [
                ...state.conversations,
                conversation
            ]
        })),

    setSelectedConversation: (conversation) =>
        set({
            selectedConversation: conversation,
            messages: []
        }),

    setMessages: (messages) =>
        set({
            messages
        }),

    addMessage: (message) =>
        set((state) => ({
            messages: [
                ...state.messages,
                message
            ]
        })),

    clearMessages: () =>
        set({
            messages: []
        }),

    setConnectionStatus: (status) =>
        set({
            connectionStatus: status
        })

}));