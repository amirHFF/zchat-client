import type { ConversationModel } from "../model/ConversationModel";

export function isBotConversation(conversation: ConversationModel): boolean {
  return (
    Boolean(conversation.parentHash) ||
    (conversation.participants?.some((participant) =>
      participant.startsWith("bot-"),
    ) ??
      false) ||
    conversation.targetJid.startsWith("bot-")
  );
}

export function getBotId(conversation: ConversationModel): string | undefined {
  return (
    conversation.participants?.find((participant) =>
      participant.startsWith("bot-"),
    ) ??
    (conversation.targetJid.startsWith("bot-")
      ? conversation.targetJid
      : undefined)
  );
}
