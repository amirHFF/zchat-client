import { create } from "zustand";

import type { Conversation } from "../model/Conversation";
import type { XmppMessage } from "../model/XmppMessage";

export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected";

interface ChatStore {

    conversations: Conversation[];

    messages: Map<number, XmppMessage[]>;

    selectedConversationId?: number;

    connectionStatus: ConnectionStatus;

    addConversation(
        conversation: Conversation
    ): void;

    setSelectedConversation(
        conversationId: number
    ): void;

    addMessage(
        message: XmppMessage
    ): void;

    setConnectionStatus(
        status: ConnectionStatus
    ): void;

    conversationListener(
        listener: (conversation: Conversation) => void
    ): void;
}

let listener:
    ((conversation: Conversation) => void)
    | undefined;

export const useChatStore = create<ChatStore>((set, get) => ({

    conversations: [],

    messages: new Map<number, XmppMessage[]>(),

    selectedConversationId: undefined,

    connectionStatus: "disconnected",

    addConversation: (conversation) =>

        set((state) => ({

            conversations: [
                ...state.conversations,
                conversation
            ]

        })),

    setSelectedConversation: (conversationId) =>

        set({

            selectedConversationId: conversationId

        }),

    addMessage: (message) =>

        set((state) => {

            const messages =
                new Map(state.messages);

            const conversationMessages =
                messages.get(message.conversationId) ?? [];

            messages.set(

                message.conversationId,

                [
                    ...conversationMessages,
                    message
                ]

            );

            const conversation =
                state.conversations.find(
                    c => c.id === message.conversationId
                );

            if (conversation) {

                listener?.(conversation);

            }

            return {

                messages

            };

        }),

    setConnectionStatus: (status) =>

        set({

            connectionStatus: status

        }),

    conversationListener: (newListener) => {

        listener = newListener;

    }

}));