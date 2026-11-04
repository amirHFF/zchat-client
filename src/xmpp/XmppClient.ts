import { Strophe, $pres } from "strophe.js";
import type { XmppMessage } from "../model/XmppMessage";
const chatWebSocketAddress = import.meta.env.VITE_API_CHAT_SERVER_ADDRESS;

export type ConnectionStatusListener = (status: number) => void;

export class XmppClient {
  private static instance: XmppClient;

  private connection!: InstanceType<typeof Strophe.Connection>;
  private readonly websocketUrl: string;

  private connected = false;

  // Keep the original credentials so a dropped mobile WebSocket can be
  // restored without requiring a page refresh.
  private jid?: string;
  private password?: string;
  private refreshPassword?: () => Promise<string | undefined>;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private reconnectAttempt = 0;
  private shouldReconnect = false;
  private hasConnectedOnce = false;

  private statusListener?: ConnectionStatusListener;

  private constructor() {
    // بعداً از env می‌خوانیم
    this.websocketUrl = chatWebSocketAddress;
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
      this.connection = new Strophe.Connection(this.websocketUrl, {
        mechanisms: [Strophe.SASLPlain], // Force PLAIN
      });
    }
  }

  /**
   * اتصال به Openfire
   */
  public connect(
    jid: string,
    password: string | undefined,
    refreshPassword?: () => Promise<string | undefined>,
  ): Promise<void> {
    Strophe.log = function (level: any, msg: any) {
      console.log(level, msg);
    };
    this.createConnection();

    this.jid = jid;
    this.password = password;
    this.refreshPassword = refreshPassword;
    this.shouldReconnect = true;
    this.hasConnectedOnce = false;
    this.reconnectAttempt = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    return new Promise((resolve, reject) => {
      console.log("jid : " + jid);

      this.connection!.connect(
        jid,

        password,

        (status: number) => {
          this.connected = status === Strophe.Status.CONNECTED;

          this.statusListener?.(status);

          switch (status) {
            case Strophe.Status.CONNECTED:
              this.hasConnectedOnce = true;
              this.reconnectAttempt = 0;

              console.log("Connected.");
              console.log("jid : " + jid);

              resolve();

              break;

            case Strophe.Status.AUTHFAIL:
              reject(new Error("Authentication failed."));

              break;

            case Strophe.Status.CONNFAIL:
              this.connected = false;
              this.scheduleReconnect();

              reject(new Error("Connection failed."));

              break;

            case Strophe.Status.DISCONNECTED:
              this.connected = false;
              this.scheduleReconnect();

              console.log("Disconnected.");

              break;
          }
        },
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

    // Explicit logout/disconnect must not trigger the recovery loop.
    this.shouldReconnect = false;
    this.refreshPassword = undefined;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.connection.disconnect();

    this.connected = false;
  }

  /** Retry a dropped connection with one capped, backoff timer at a time. */
  private scheduleReconnect(): void {
    if (
      !this.shouldReconnect ||
      !this.hasConnectedOnce ||
      this.reconnectTimer
    ) {
      return;
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30000);
    this.reconnectAttempt += 1;
    console.warn(`XMPP disconnected; retrying in ${delay}ms.`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = undefined;
      if (!this.shouldReconnect || !this.jid) return;

      // A long-idle mobile tab may also have an expired Keycloak token.
      // Refresh it before retrying when the caller provided a provider.
      try {
        if (this.refreshPassword) {
          this.password = await this.refreshPassword();
        }
      } catch (error) {
        console.warn("Could not refresh XMPP credentials:", error);
        this.scheduleReconnect();
        return;
      }

      // Strophe invokes the same status callback for every retry. The
      // facade restores its stanza handlers after CONNECTED because
      // Strophe clears handler lists when a new connect() begins.
      this.connection.connect(this.jid, this.password, (status: number) => {
        this.connected = status === Strophe.Status.CONNECTED;
        this.statusListener?.(status);

        if (status === Strophe.Status.CONNECTED) {
          this.hasConnectedOnce = true;
          this.reconnectAttempt = 0;
        } else if (
          status === Strophe.Status.CONNFAIL ||
          status === Strophe.Status.DISCONNECTED ||
          status === Strophe.Status.AUTHFAIL
        ) {
          this.connected = false;
          this.scheduleReconnect();
        }
      });
    }, delay);
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
      throw new Error("Connection has not been created.");
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
  public setStatusListener(listener: ConnectionStatusListener): void {
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
    error?: (error: Element) => void,
  ): void {
    if (!this.connected) {
      throw new Error("Not connected.");
    }

    this.connection.sendIQ(stanza, success, error);
  }
  public addMessageListener(listener: (message: XmppMessage) => void) {
    this.addHandler(
      (stanza: Element) => {
        const conversationHash = stanza.getElementsByTagNameNS(
          "urn:zchat:message",
          "zchat",
        )[0].textContent;

        const body = stanza.getElementsByTagName("body")[0]?.textContent ?? "";

        listener({
          id: stanza.getAttribute("id") ?? "",

          hash: conversationHash ?? "",

          from: stanza.getAttribute("from") ?? "",

          to: stanza.getAttribute("to") ?? "",

          type: stanza.getAttribute("type") ?? "",

          body,
          xmlns: stanza.getAttribute("xmlns") ?? "",
        });

        return true;
      },

      undefined,

      "message",
    );
  }
  public addPresenceListener(listener: (presence: Element) => void) {
    return this.addHandler(
      (stanza: Element) => {
        listener(stanza);

        return true;
      },

      undefined,
      "presence",
    );
  }
  public addIqListener(listener: (iq: Element) => void) {
    return this.addHandler(
      (stanza: Element) => {
        listener(stanza);

        return true;
      },

      undefined,
      "iq",
    );
  }
  public addHandler(
    handler?: InstanceType<typeof Strophe.handler>,
    ns?: string,
    name?: string,
    type?: string,
    id?: string,
    from?: string,
  ) {
    return this.connection.addHandler(handler, ns, name, type, id, from);
  }
  public removeHandler(handler: any): void {
    this.connection.deleteHandler(handler);
  }
  public addTimedHandler(period: number, handler: () => boolean) {
    return this.connection.addTimedHandler(period, handler);
  }
  public sendPresence(): void {
    this.send($pres().tree());
  }
}
