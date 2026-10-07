export interface XmppMessage {
    id: string;

    hash:string;

    from: string;

    to?: string;

    body: string;

    type: string;

    xmlns:string

}