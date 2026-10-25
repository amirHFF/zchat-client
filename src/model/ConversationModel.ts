export interface ConversationModel {
    hash: string;
    targetJid: string;
    jid: string;
    lastMessage: string|undefined;
    lastMessageTime: string;
    title:string;
    parentHash?: string;
    conversationType?: string;
    participants?: string[];
}
