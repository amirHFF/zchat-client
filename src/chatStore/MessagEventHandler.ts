import { useChatStore } from "../chatStore/ChatStore";
import type { ChatMessage } from "../model/ChatMessage";
import type { ConversationModel } from "../model/ConversationModel";
import type { XmppMessage } from "../model/XmppMessage";
import { OrchestratorRestClient } from "../restClient/OrchestratorRestClient";

const localPart = (jid: string) => jid.split("/")[0].split("@")[0];

export class MessageEventHandler {

    public onIncomingMessage(receivedMessage: XmppMessage) {
        const state = useChatStore.getState();

        console.log("incoming message:", receivedMessage);

        if (!receivedMessage.from || !receivedMessage.body?.trim()) {
            console.warn("Invalid incoming message:", receivedMessage);
            return;
        }

        const ownJid = state.selectedConversation?.jid ?? state.conversations[0]?.jid;
        if (!ownJid) {
            console.warn("Own jid unknown, cannot handle message");
            return;
        }

        const now = Date.now().toString();

        // 1) پیدا کردن گفت‌وگوی موجود: اول با hash، بعد با jid
        const existing =
            state.conversations.find(
                (c) => !!receivedMessage.hash && c.hash === receivedMessage.hash,
            ) ??
            state.conversations.find(
                (c) => localPart(c.targetJid) === localPart(receivedMessage.from),
            );

        if (existing) {
            // 2) آپدیت lastMessage و آوردن به بالای لیست
            state.bumpConversation(
                (c) =>
                    existing.hash
                        ? c.hash === existing.hash
                        : c.targetJid === existing.targetJid,
                { lastMessage: receivedMessage.body, lastMessageTime: now },
            );
        } else {
            // 3) گفت‌وگوی جدید
            const newConversation: ConversationModel = {
                hash: receivedMessage.hash,
                jid: ownJid,
                targetJid: receivedMessage.from,
                title: receivedMessage.from,
                lastMessage: receivedMessage.body,
                lastMessageTime: now,
            };

            OrchestratorRestClient.addConversation(
                [receivedMessage.from, ownJid],
                receivedMessage.body,
            );
            state.addConversation(newConversation);
        }

        // 4) اضافه کردن پیام به لیست پیام‌ها فقط اگر همین گفت‌وگو باز است
        const selected = useChatStore.getState().selectedConversation;
        const isCurrent =
            !!selected &&
            (receivedMessage.hash && selected.hash
                ? selected.hash === receivedMessage.hash
                : localPart(selected.targetJid) === localPart(receivedMessage.from));

        if (isCurrent) {
            state.addMessage({
                id: receivedMessage.id,
                conversationId: selected.hash || selected.targetJid,
                text: receivedMessage.body,
                outgoing: false,
                timestamp: Date.now(),
            });
        }
    }

    public onOutgoingMessage(
        toJid: string,
        body: string
    ): void {

        const state = useChatStore.getState();

        const target =
            state.conversations.find(
                (c) => localPart(c.targetJid) === localPart(toJid),
            ) ?? state.selectedConversation;

        if (!target) {
            console.warn("Conversation not found for outgoing message:", toJid);
            return;
        }

        // 1) آپدیت lastMessage و جابه‌جایی به بالای لیست
        state.bumpConversation(
            (c) =>
                target.hash
                    ? c.hash === target.hash
                    : c.targetJid === target.targetJid,
            { lastMessage: body, lastMessageTime: Date.now().toString() },
        );

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