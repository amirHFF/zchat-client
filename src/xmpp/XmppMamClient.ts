import { $iq, Strophe } from "strophe.js";
import { XmppClient } from "./XmppClient";
import type { ChatMessage } from "../model/ChatMessage";

export class XmppMamClient {

    private readonly client: XmppClient;

    private mamHandler: any;

    constructor(client: XmppClient) {

        this.client = client;

    }

    public loadHistory(
        ownerJid: string,
        targetJid: string,
        conversationId:string,
        callback: (messages: ChatMessage[]) => void
    ): void {

        this.removeMamHandler();

        const queryId =
            "mam-" + Date.now();

        const messages: ChatMessage[] = [];

        this.mamHandler =
            this.client.addHandler(

                stanza => {

                    const result =
                        stanza.getElementsByTagNameNS(
                            "urn:xmpp:mam:2",
                            "result"
                        )[0];

                    if (!result) {
                        return true;
                    }

                    const forwarded =
                        result.getElementsByTagNameNS(
                            "urn:xmpp:forward:0",
                            "forwarded"
                        )[0];

                    if (!forwarded) {
                        return true;
                    }

                    const message =
                        forwarded.getElementsByTagName(
                            "message"
                        )[0];

                    if (!message) {
                        return true;
                    }

                    const chatMessage =
                        this.parseMamMessage(
                            ownerJid,
                            message
                            ,conversationId
                        );

                    if (chatMessage) {

                        messages.push(
                            chatMessage
                        );

                    }

                    return true;

                },

                undefined,

                "message"

            );

        this.client.sendIQ(

            this.buildMamQuery(
                targetJid,
                queryId
            ),

            stanza => {

                messages.sort((a, b) => a.timestamp - b.timestamp);
                callback(messages);

                this.removeMamHandler();

            },

            error => {

                console.error(error);

                this.removeMamHandler();

            }

        );

    }

    public removeMamHandler(): void {

        if (!this.mamHandler) {
            return;
        }

        this.client.removeHandler(
            this.mamHandler
        );

        this.mamHandler = undefined;

    }

    private buildMamQuery(
        jid: string,
        queryId: string
    ): Element {

        return $iq({

            type: "set",

            id: queryId

        })

            .c("query", {

                xmlns: "urn:xmpp:mam:2",

                queryid: queryId

            })

            .c("x", {

                xmlns: "jabber:x:data",

                type: "submit"

            })

            .c("field", {

                var: "FORM_TYPE",

                type: "hidden"

            })

            .c("value")

            .t("urn:xmpp:mam:2")

            .up()

            .up()

            .c("field", {

                var: "with"

            })

            .c("value")

            .t(jid)

            .tree();

    }

    private parseMamMessage(
        ownerJid: string,
        message: Element ,
        conversationId:string
    ): ChatMessage | null {

        const body =
            message.getElementsByTagName(
                "body"
            )[0];

        if (!body) {

            return null;

        }

        const from =
            message.getAttribute("from") ?? "";

        const delay =
            message.getElementsByTagNameNS(
                "urn:xmpp:delay",
                "delay"
            )[0];

        return {

            id: 
                message.getAttribute("id")
                ?? Date.now().toString(),

            conversationId: conversationId,

            text:
                body.textContent ?? "",

            outgoing:
                Strophe.getBareJidFromJid(from)
                === ownerJid,

            timestamp:
                delay?.getAttribute("stamp")
                ? Date.parse(
                    delay.getAttribute("stamp")!
                )
                : Date.now()

        };

    }

}