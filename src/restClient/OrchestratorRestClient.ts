import keycloak from "../auth/Keycloak";
import type { ChatBot } from "../model/ChatBot";
import type { ChatMessage } from "../model/ChatMessage";
import type { ConversationModel } from "../model/ConversationModel";
const orchestratorUrl = import.meta.env.VITE_API_ORCHESTRATOR_URL;

function resolveConversationHash(conversation: {
  hash?: string;
  conversationHash?: string;
  id?: string;
  jid?: string;
}): string {
  // Backend may expose the conversation key as hash / conversationHash / id / jid
  return (
    conversation.hash ||
    conversation.conversationHash ||
    conversation.id ||
    conversation.jid ||
    ""
  );
}

export class OrchestratorRestClient {
  static async fetchConversations(
    username: string,
  ): Promise<ConversationModel[] | undefined> {
    try {
      const response = await fetch(
        `${orchestratorUrl}/conversations/${username}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${keycloak.token}`,
          },
        },
      );

      if (response.ok) {
        const conversations: FetchedConversation[] = await response.json();

        return conversations
          .filter((c) => c.participants.length === 2)
          .map((c) => {
            const currentUser = username;

            const targetJid = c.participants.find(
              (participant) => participant !== currentUser,
            )!;

            const hash = resolveConversationHash(c);
            if (!hash) {
              console.warn("Conversation has no hash from API:", c);
            }

            return {
              hash,
              jid: currentUser,
              targetJid,
              title: c.title,
              lastMessage: c.lastMessage,
              lastMessageTime: c.lastMessageTime || c.timeStamp || "",
            };
          });
      } else {
        console.error("fetching conversations failed");
      }
    } catch (error) {
      console.error("Error fetchingconversations:", error);
      return undefined;
    }
  }
  static async addConversation(
    jids: string[],
    text: string,
  ): Promise<AddConversationResponse> {
    try {
      const response = await fetch(`${orchestratorUrl}/conversations`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({
          participants: jids,
          lastMessage: text,
          conversationType: "CHAT",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Conversation added successfully:");
      const added: AddConversationResponse = await response.json();
      return {
        ...added,
        hash: resolveConversationHash(added),
      };
    } catch (error) {
      console.error("Error adding conversation:", error);
      throw error; // یا مدیریت خطا به هر شکلی که می‌خوای
    }
  }
  static async loadConversationMessages(
    conversationHash: string,
  ): Promise<ChatMessage[]> {
    try {
      const currentUser = keycloak.tokenParsed?.preferred_username ?? "";

      const response = await fetch(
        `${orchestratorUrl}/conversations/message/load/${conversationHash}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${keycloak.token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const loadedMessages: LoadedConversationMessage[] = await response.json();

      return loadedMessages
        .map((message, index) => ({
          id: message.id ?? `${conversationHash}-${message.timeStamp}-${index}`,
          conversationId: conversationHash,
          text: message.content,
          outgoing: message.from === currentUser,
          timestamp: Number(message.timeStamp) || 0,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error("Error loading conversation messages:", error);
      return [];
    }
  }

  static async getAllChatBots(): Promise<ChatBot[]> {
    try {
      const response = await fetch(`${orchestratorUrl}/bot/list?enabled=true`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      if (response.ok) {
        const bots: ChatBot[] = await response.json();

        return bots.map((c) => ({
          botID: c.botID,
          name: c.name,
          displayName: c.displayName,
          description: c.description ?? "nothing yet",
        }));
      } else {
        console.error("fetching chatbots failed");
        return [];
      }
    } catch (error) {
      console.error("Error fetching chatbot:", error);
      return [];
    }
  }
}

class FetchedConversation {
  public hash?: string;
  public conversationHash?: string;
  public id?: string;
  public jid?: string;
  public participants: string[] = [];
  public title: string = "";
  public lastMessage: string | undefined;
  public lastMessageTime: string = "";
  public timeStamp?: string;
}
interface AddConversationResponse {
  hash: string;
  conversationHash?: string;
  id?: string;
  jid: string;
  participants: string[];
  lastmessage: string;
  title: string;
}
interface LoadedConversationMessage {
  id: string | null;
  from: string;
  to: string;
  content: string;
  timeStamp: string;
}
