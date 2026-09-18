import keycloak from "../auth/Keycloak";
import type { ChatBot } from "../model/ChatBot";
import type { ConversationModel } from "../model/ConversationModel";
const orchestratorUrl = import.meta.env.VITE_API_ORCHESTRATOR_URL;

export class OrchestratorRestClient {

    static async fetchConversations(username: string): Promise<ConversationModel[] | undefined> {

        try {
            debugger
            const response = await fetch(
                `${orchestratorUrl}/conversations/${username}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${keycloak.token}`
                    }
                }
            );

            if (response.ok) {

                const conversations: FetchedConversation[] =
                    await response.json();

                return conversations
                    .filter(c => c.participants.length === 2)
                    .map(c => {

                        let jid = username;

                        const targetJid = c.participants.find(
                            participant => participant !== jid
                        )!;

                        return {
                            jid,
                            targetJid,
                            title:c.title,
                            lastMessage: c.lastMessage,
                            lastMessageTime: c.lastMessageTime
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
    static async addConversation(jids: string[], text: string) :Promise<AddConversationResponse> {
        try {
            const response = await fetch(`${orchestratorUrl}/conversations`, {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json" ,
                    "Authorization": `Bearer ${keycloak.token}`
                },
                body: JSON.stringify({
                    participants: jids,
                    lastMessage: text ,
                    conversationType:"CHAT"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Conversation added successfully:");
            return await response.json();


        } catch (error) {
            console.error("Error adding conversation:", error);
            throw error; // یا مدیریت خطا به هر شکلی که می‌خوای
        }
    }
    static async getAllChatBots(): Promise<ChatBot[]> {
        try {
            const response = await fetch(
                `${orchestratorUrl}/bot/list`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${keycloak.token}`
                    }
                }
            );

            if (response.ok) {
                const bots: ChatBot[] = await response.json();

                return bots.map(c => ({
                    botID: c.botID,
                    name: c.name,
                    displayName: c.displayName,
                    description: c.description ?? "nothing yet"
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
    public participants: string[] = [];
    public title: string= "";
    public lastMessage: string | undefined;
    public lastMessageTime: string = "";
}
interface AddConversationResponse { 
    jid: string;
    participants: string[],
    lastmessage: string,
     title: string; }