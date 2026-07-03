import { createClient, type Agent } from "stanza";

export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected"
    | "disconnecting";

export class XmppStanzaClient {

    private static instance: XmppStanzaClient;

    private client?: Agent;

    private status: ConnectionStatus = "disconnected";

    private statusListener?: (status: ConnectionStatus) => void;

    private messageListener?: (msg: any) => void;

    private constructor() {}

    public static getInstance(): XmppStanzaClient {

        if (!XmppStanzaClient.instance) {
            XmppStanzaClient.instance = new XmppStanzaClient();
        }

        return XmppStanzaClient.instance;
    }

    /**
     * Create stanza client.
     */
    public createConnection() {

        if (this.client) {
            return;
        }

        this.client = createClient({

            transports: {
                websocket: "wss://zchat.ir:7070/ws"
            },

            resource: "web",

            softwareVersion: {
                name: "ZChat",
                version: "1.0"
            }

        });

        this.registerInternalEvents();
    }

    /**
     * Connect to server.
     */
    public async connect(
        jid: string,
        password: string
    ): Promise<void> {

        if (!this.client) {
            throw new Error("Connection not created.");
        }

        this.status = "connecting";
        this.notifyStatus();

        this.client.config.jid = jid;
        this.client.config.password = password;

        await this.client.connect();
    }

    /**
     * Disconnect.
     */
    public async disconnect(): Promise<void> {

        if (!this.client) {
            return;
        }

        this.status = "disconnecting";
        this.notifyStatus();

        await this.client.disconnect();
    }

    public isConnected(): boolean {

        return this.status === "connected";
    }

    public getConnection(): Agent {

        if (!this.client) {
            throw new Error("Connection not created.");
        }

        return this.client;
    }

    public getStatus(): ConnectionStatus {
        return this.status;
    }

    public setStatusListener(
        listener: (status: ConnectionStatus) => void
    ) {

        this.statusListener = listener;
    }

    public setMessageListener(
        listener: (msg: any) => void
    ) {

        this.messageListener = listener;
    }

    /**
     * Send raw stanza.
     */
public send(
    kind: string,
    data: any
) {

    if (!this.client) {
        throw new Error("Connection not created.");
    }

    this.client.send(kind as any, data);
}

    /**
     * Send initial presence.
     */
    public sendPresence() {

        if (!this.client) {
            throw new Error("Connection not created.");
        }

        this.client.sendPresence();
    }

    /**
     * Register internal stanza events.
     */
    private registerInternalEvents() {

        if (!this.client) {
            return;
        }

        this.client.on("session:started", () => {

            this.status = "connected";
            this.notifyStatus();

        });

        this.client.on("disconnected", () => {

            this.status = "disconnected";
            this.notifyStatus();

        });

        this.client.on("message", (msg) => {

            this.messageListener?.(msg);

        });

    }

    private notifyStatus() {

        this.statusListener?.(this.status);

    }

}