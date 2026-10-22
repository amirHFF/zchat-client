import { create } from "zustand";

import type { ConversationModel } from "../model/ConversationModel";
import type { ChatMessage } from "../model/ChatMessage";
import type { ChatBot } from "../model/ChatBot";
import { sortConversations } from "../utils/formatTimestamp";

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
    bumpConversation(
        match: (c: ConversationModel) => boolean,
        patch: Partial<ConversationModel>
    ): void;
}

export const useChatStore = create<ChatStore>((set) => ({
    mobileView: "list",
    setMobileView: (view) => set({ mobileView: view }),

    conversations: [],

    selectedConversation: undefined,

    messages: [],

    bots: [],

    connectionStatus: "disconnected",

    addConversation: (conversation) =>
        set((state) => {
            const exists = state.conversations.some(
                (c) =>
                    (conversation.hash && c.hash === conversation.hash) ||
                    c.targetJid === conversation.targetJid
            );
            if (exists) return state;

            return {
                conversations: sortConversations([...state.conversations, conversation]),
            };
        }),
        
    setConversations: (conversations) =>
        set({ conversations: sortConversations(conversations) }),

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
    setBots: (bots) =>
        set({ bots })
    ,
    // bumpConversation: (match, patch) =>
    //     set((state) => {
    //         const index = state.conversations.findIndex(match);
    //         if (index === -1) return state;

    //         const updated = { ...state.conversations[index], ...patch };
    //         const rest = state.conversations.filter((_, i) => i !== index);

    //         return {
    //             // گفت‌وگوی به‌روز‌شده می‌رود اول لیست
    //             conversations: [updated, ...rest],
    //             // اگر همین گفت‌وگو باز است، نسخه‌ی selected هم هماهنگ شود
    //             selectedConversation:
    //                 state.selectedConversation && match(state.selectedConversation)
    //                     ? { ...state.selectedConversation, ...patch }
    //                     : state.selectedConversation,
    //         };
    //     }),
    bumpConversation: (match, patch) =>
        set((state) => {
            if (!state.conversations.some(match)) return state;

            const conversations = state.conversations.map((c) =>
                match(c) ? { ...c, ...patch } : c
            );

            return {
                conversations: sortConversations(conversations),
                selectedConversation:
                    state.selectedConversation && match(state.selectedConversation)
                        ? { ...state.selectedConversation, ...patch }
                        : state.selectedConversation,
            };
        }),

}));