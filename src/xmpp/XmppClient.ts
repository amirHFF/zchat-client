// import $pres from "strophe.js";
// import Strophe from "strophe.js";

import {Strophe,$pres} from "strophe.js";



export type ConnectionStatusListener = (status: number) => void;

export class XmppClient {

    private static instance: XmppClient;

    private connection!: InstanceType<typeof Strophe.Connection>;
    private readonly websocketUrl: string;

    private connected = false;

    private statusListener?: ConnectionStatusListener;

    private constructor() {

        // بعداً از env می‌خوانیم
        this.websocketUrl = "ws://130.185.121.173:7070/ws/";

    }

    public static getInstance(): XmppClient {

        if (!XmppClient.instance) {

            XmppClient.instance = new XmppClient();

        }

        return XmppClient.instance;

    }

    /**
     * ایجاد Connection
     */
    private createConnection(): void {

        if (!this.connection) {

            this.connection = new Strophe.Connection(
                this.websocketUrl
            );

        }

    }

    /**
     * اتصال به Openfire
     */
    public connect(
        jid: string,
        password: string
    ): Promise<void> {

        this.createConnection();

        return new Promise((resolve, reject) => {
            console.log("jid : "+jid);

            this.connection!.connect(

                jid,

                password,

                (status: number) => {

                    this.connected =
                        status === Strophe.Status.CONNECTED;

                    this.statusListener?.(status);

                    switch (status) {

                        case Strophe.Status.CONNECTED:

                            console.log("Connected.");
                            console.log("jid : "+jid);


                            resolve();

                            break;

                        case Strophe.Status.AUTHFAIL:

                            reject(
                                new Error("Authentication failed.")
                            );

                            break;

                        case Strophe.Status.CONNFAIL:

                            reject(
                                new Error("Connection failed.")
                            );

                            break;

                        case Strophe.Status.DISCONNECTED:

                            console.log("Disconnected.");

                            break;

                    }

                }

            );

        });

    }

    /**
     * قطع اتصال
     */
    public disconnect(): void {

        if (!this.connection) {

            return;

        }

        this.connection.disconnect();

        this.connected = false;

    }

    /**
     * آیا وصل هستیم؟
     */
    public isConnected(): boolean {

        return this.connected;

    }

    /**
     * دسترسی به Connection
     */
    public getConnection(): InstanceType<typeof Strophe.Connection> {

        if (!this.connection) {

            throw new Error(
                "Connection has not been created."
            );

        }

        return this.connection;

    }

    /**
     * وضعیت اتصال
     */
    public getStatus(): number {

        if (!this.connection) {

            return Strophe.Status.DISCONNECTED;

        }

        return this.connection.connected
            ? Strophe.Status.CONNECTED
            : Strophe.Status.DISCONNECTED;

    }

    /**
     * ثبت Listener وضعیت اتصال
     */
    public setStatusListener(
        listener: ConnectionStatusListener
    ): void {

        this.statusListener = listener;

    }
    public send(stanza: Element): void {

        if (!this.connected) {
            throw new Error("Not connected.");
        }

        this.connection.send(stanza);

    }
    public sendIQ(
        stanza: Element,
        success?: (result: Element) => void,
        error?: (error: Element) => void
    ): void {

        if (!this.connected) {
            throw new Error("Not connected.");
        }

        this.connection.sendIQ(
            stanza,
            success,
            error
        );

    }
    public addHandler(
        handler: InstanceType<typeof Strophe.handler>,
        ns?: string,
        name?: string,
        type?: string,
        id?: string,
        from?: string
    ) {

        return this.connection.addHandler(
            handler,
            ns,
            name,
            type,
            id,
            from
        );

    }
    public removeHandler(handler: any): void {

        this.connection.deleteHandler(handler);

    }
    public addTimedHandler(
        period: number,
        handler: () => boolean
    ) {

        return this.connection.addTimedHandler(
            period,
            handler
        );

    }
    public sendPresence(): void {

        this.send(
            $pres().tree()
        );

    }

}