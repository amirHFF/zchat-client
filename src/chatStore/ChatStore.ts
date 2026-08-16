import { create } from "zustand";

import type { ConversationModel } from "../model/ConversationModel";
import type { ChatMessage } from "../model/ChatMessage";
import type { ChatBot } from "../model/ChatBot";

export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected";

interface ChatStore {
    mobileView: "list" | "chat";
    
    setMobileView: (view: "list" | "chat") => void;

    conversations: ConversationModel[];

    selectedConversation?: ConversationModel;

    messages: ChatMessage[];

    bots: ChatBot[];

    connectionStatus: ConnectionStatus;

    addConversation(
        conversation: ConversationModel
    ): void;
    setConversations: (conversations: ConversationModel[]) => void;
    // setConversations: (conversations: ConversationModel[]) => void;

    setSelectedConversation(
        conversation: ConversationModel
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

    setBots(
        bots: ChatBot[]
    ): void;
}

export const useChatStore = create<ChatStore>((set) => ({
    mobileView: "list",
setMobileView: (view) => set({ mobileView: view }),

    conversations: [],

    selectedConversation: undefined,

    messages: [],

    bots :[],

    connectionStatus: "disconnected",

    addConversation: (conversation) =>
        set((state) => {
            // جلوگیری از اضافه شدن تکراری
            const exists = state.conversations.some(
                (c) => c.targetJid === conversation.targetJid
            );
            if (exists) return state;

            return {
                conversations: [...state.conversations, conversation]
            };
        }),
    setConversations: (conversations) =>
        set({ conversations }),

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
        }),
    setBots: (bots)=>
        set({bots})

}));