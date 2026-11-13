export interface ChatBot {
  name: string;
  displayName: string;
  botID: string;
  description: string;
  ownerUserName?: string | null;
  promptCode?: string;
  aiModel?: string;
  scope?: string;
  enabled?: boolean;
}
