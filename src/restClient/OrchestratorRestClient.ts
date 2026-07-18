import type { ConversationModel } from "../model/ConversationModel";
const orchestratorUrl = import.meta.env.VITE_API_ORCHESTRATOR_URL;

export class OrchestratorRestClient {

    static async fetchConversations(username: string): Promise<ConversationModel[]> {

        try {
            const response = await fetch(
                `${orchestratorUrl}/conversations/${username}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (response.ok) {

                const conversations: FetchedConversation[] =
                    await response.json();

                return conversations
                    .filter(c => c.participants.length === 2)
                    .map(c => {

                        let jid = username.concat("@zchat.ir");

                        const targetJid = c.participants.find(
                            participant => participant !== jid
                        )!;

                        return {
                            jid,
                            targetJid,
                            lastMessage: c.lastMessage,
                            lastMessageTime: c.lastMessageTime
                        };
                    });

            } else {
                console.error("fetching conversations failed");

            }
        } catch (error) {
            console.error("Error fetchingconversations:", error);
            return null;
        }
    }
    static async addConversation(jids: string[] , text:string) {
        try {
            const response = await fetch(`${orchestratorUrl}/conversations`, {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"   // ← خیلی مهمه!
                },
                body: JSON.stringify({
                    participants: jids,
                    lastMessage: text
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response;
            console.log("Conversation added successfully:", data);
            return data;

        } catch (error) {
            console.error("Error adding conversation:", error);
            throw error; // یا مدیریت خطا به هر شکلی که می‌خوای
        }
    }
}

class FetchedConversation {
    public participants: string[];
    public lastMessage: string;
    public lastMessageTime: string;
}
class SaveConversation {
    public participants: string[];
    public lastMessage: string;
}