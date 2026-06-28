export interface XmppMessage {

    from: string;

    to?: string;

    body: string;

    timestamp: Date;

}