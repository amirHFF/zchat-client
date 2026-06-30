import { $iq } from "strophe.js";

import { XmppClient } from "./XmppClient";

export class XmppMamService {

    constructor(
        private readonly client: XmppClient
    ) {
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

const handler =
    this.client.addHandler(

        (stanza: Element) => {

            const result =
                stanza.getElementsByTagName(
                    "result"
                )[0];

            if (!result)
                return true;

            if (
                result.namespaceURI !==
                "urn:xmpp:mam:2"
            )
                return true;


            const forwarded =
                result.getElementsByTagName(
                    "forwarded"
                )[0];

            if (!forwarded)
                return true;

            const message =
                forwarded.getElementsByTagName(
                    "message"
                )[0];

            if (!message)
                return true;

        },

        undefined,

        "message"

    );
}