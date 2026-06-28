import     $msg from "strophe.js";
import     $pres from "strophe.js";

import { XmppClient } from "./XmppClient";

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
    ): void {

        this.messageListeners.push(
            listener
        );

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

}