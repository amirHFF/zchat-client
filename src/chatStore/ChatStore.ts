import { create } from "zustand";

import type { Conversation } from "../model/Conversation";
import type { ChatMessage } from "../model/ChatMessage";

export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected";

interface ChatStore {

    conversations: Conversation[];

    selectedConversation?: Conversation;

    messages: ChatMessage[];

    connectionStatus: ConnectionStatus;

    addConversation(
        conversation: Conversation
    ): void;

    setSelectedConversation(
        conversation: Conversation
    ): void;

    setMessages(
        messages: ChatMessage[]
    ): void;

    addMessage(
        message: ChatMessage
    ): void;

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
            selectedConversation: conversation
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

    setConnectionStatus: (status) =>
        set({
            connectionStatus: status
        })

}));