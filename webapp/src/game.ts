import WZDConnection from "./connection";

const URL = "192.168.0.30:9090/ws";

export default class Game {
    conn: WZDConnection;

    constructor() {}

    async join(nick: string) {
        this.conn = new WZDConnection(this.receive.bind(this));
        await this.conn.connect(URL);
        this.conn.send({ type: "join", nick });
    }
    receive(data: Record<string, any>) {}
    async update() {}
    async draw() {}
}
