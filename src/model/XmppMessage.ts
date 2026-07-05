export interface XmppMessage {
    id: string;

    from: string;

    to?: string;

    body: string;

    type: string;

    xmlns:string

}