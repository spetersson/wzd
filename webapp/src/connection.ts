export default class WZDConnection {
    private conn: WebSocket;

    constructor(private receive: (data: Record<string, any>) => void) {}

    async connect(path: string) {
        return new Promise<void>((resolve, reject) => {
            if (this.conn) {
                reject(new Error("Already connected"));
                return;
            }

            this.conn = new WebSocket(`ws://${path}/ws`);
            this.conn.onerror = () => {
                this.conn = null;
                reject(new Error("Failed to connect"));
            };
            this.conn.onopen = () => {
                this.conn.onmessage = (ev) => {
                    this.onmessage(ev);
                };
                this.conn.onerror = (ev) => {
                    this.onerror(ev);
                };
                resolve();
            };
        });
    }

    send(data: Record<string, any>) {
        if (!this.conn) {
            throw new Error(`Can't send, not connected`);
        }

        this.conn.send(JSON.stringify(data));
    }

    private async onmessage(ev: MessageEvent) {
        console.log("Message:", ev.data);
        const data = JSON.parse(String(ev.data));
        this.receive(data);
    }
    private async onerror(ev: Event) {
        console.error(ev);
    }
}
