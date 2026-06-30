import   {$msg,  $pres} from "strophe.js";
import { XmppClient } from "./XmppClient";
import { $iq } from "strophe.js";
import type { XmppMessage } from "../model/XmppMessage";
import type { XmppPresence } from "../model/XmppPresence.ts";

export class XmppServer {

    private static instance: XmppServer;

    private readonly client: XmppClient;

    private messageListeners:
        Array<(message: XmppMessage) => void> = [];

    private presenceListeners:
        Array<(presence: XmppPresence) => void> = [];

    private constructor() {

        this.client = XmppClient.getInstance();

    }

    public static getInstance(): XmppServer {

        console.log("getindtance 1")
        if (!XmppServer.instance) {

            XmppServer.instance =
                new XmppServer();

        }

        return XmppServer.instance;

    }

    // ------------------------------------
    // Login
    // ------------------------------------

    public async login(
        jid: string,
        password: string
    ): Promise<void> {
            console.log("jid : "+jid);

        await this.client.connect(
            jid,
            password
        );

        this.registerMessageHandler();

        this.registerPresenceHandler();

        this.sendPresence();

    }

    // ------------------------------------
    // Logout
    // ------------------------------------

    public logout(): void {

        this.client.disconnect();

    }

    // ------------------------------------
    // Presence
    // ------------------------------------

    public sendPresence(): void {

        const presence =
            $pres().tree();

        this.client.send(presence);

    }

    // ------------------------------------
    // Send Message
    // ------------------------------------

    public sendMessage(
        to: string,
        text: string
    ): void {

        const message =

            $msg({
                to,
                type: "chat"
            })
            .c("body")
            .t(text)
            .tree();

        this.client.send(message);

    }

    // ------------------------------------
    // Message Listeners
    // ------------------------------------

    public addMessageListener(
        listener: (
            message: XmppMessage
        ) => void
    ) {

        this.messageListeners.push(
            listener
        );
            return () => {

        this.messageListeners =
            this.messageListeners.filter(l => l !== listener);

    };

    }

    // ------------------------------------
    // Presence Listeners
    // ------------------------------------

    public addPresenceListener(
        listener: (
            presence: XmppPresence
        ) => void
    ): void {

        this.presenceListeners.push(
            listener
        );

    }

    // ------------------------------------
    // Internal Message Handler
    // ------------------------------------

    private registerMessageHandler(): void {

        this.client.addHandler(

            (stanza: Element) => {

                const bodyNode =
                    stanza.getElementsByTagName(
                        "body"
                    )[0];

                if (!bodyNode) {

                    return true;

                }

                const message: XmppMessage = {

                    from:
                        stanza.getAttribute(
                            "from"
                        ) || "",

                    to:
                        stanza.getAttribute(
                            "to"
                        ) || "",

                    body:
                        bodyNode.textContent || "",

                    timestamp:
                        new Date()

                };

                this.messageListeners
                    .forEach(
                        listener =>
                            listener(message)
                    );

                return true;

            },

            undefined,

            "message"

        );

    }

    // ------------------------------------
    // Internal Presence Handler
    // ------------------------------------

    private registerPresenceHandler(): void {

        this.client.addHandler(

            (stanza: Element) => {

                const presence:
                    XmppPresence = {

                    from:
                        stanza.getAttribute(
                            "from"
                        ) || "",

                    type:
                        stanza.getAttribute(
                            "type"
                        ) || "available"

                };

                this.presenceListeners
                    .forEach(
                        listener =>
                            listener(
                                presence
                            )
                    );

                return true;

            },

            undefined,

            "presence"

        );

    }
    public async isMamSupported(): Promise<boolean> {

    const features =
        await this.discoverFeatures();

    return (
        features.includes("urn:xmpp:mam:2") ||
        features.includes("urn:xmpp:mam:1")
    );

}
    public discoverFeatures(): Promise<string[]> {

    return new Promise((resolve, reject) => {

        const iq =
            $iq({
                type: "get",
                to: this.client
                    .getConnection()
                    .domain,
                id: "disco1"
            })
            .c("query", {
                xmlns: "http://jabber.org/protocol/disco#info"
            })
            .tree();

        this.client.sendIQ(

            iq,

            (result: Element) => {

                const features: string[] = [];

                const nodes =
                    result.getElementsByTagName(
                        "feature"
                    );

                for (
                    let i = 0;
                    i < nodes.length;
                    i++
                ) {

                    const feature =
                        nodes[i].getAttribute("var");

                    if (feature) {

                        features.push(feature);

                    }

                }

                resolve(features);

            },

            (error) => {

                reject(error);

            }

        );

    });

}

}