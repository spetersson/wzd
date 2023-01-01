import WZDConnection from "./connection";
import Inputs from "./inputs";
import { MapData } from "./map";

const VIEW_W = 50;
const SPEED = 10;

interface Player {
    nick: string;
    x: number;
    y: number;
}

interface GetMsgUpdate {
    type: "update";
    players: Player[];
}

type Msg = GetMsgUpdate;

export default class Game {
    nick: string;
    x: number;
    y: number;
    conn: WZDConnection;
    inputs: Inputs;

    players: Player[];

    constructor(private map: MapData) {
        this.x = map.width * 0.5;
        this.y = map.height * 0.5;
        this.inputs = new Inputs();
        this.players = [];
    }

    async join(host: string, nick: string) {
        this.nick = nick;
        this.conn = new WZDConnection(this.receive.bind(this));
        await this.conn.connect(host);
        this.conn.send({ type: "join", nick });
    }
    receive(msg: Msg) {
        if (msg.type === "update") {
            this.players = msg.players;
        }
    }
    async update(dt: number) {
        let moved = false;
        const movement = SPEED * dt * (this.inputs.isDown("ShiftLeft") ? 2 : 1);
        if (this.inputs.isDown("ArrowUp") || this.inputs.isDown("KeyW")) {
            this.y -= movement;
            moved = true;
        } else if (this.inputs.isDown("ArrowDown") || this.inputs.isDown("KeyS")) {
            this.y += movement;
            moved = true;
        }
        if (this.inputs.isDown("ArrowLeft") || this.inputs.isDown("KeyA")) {
            this.x -= movement;
            moved = true;
        } else if (this.inputs.isDown("ArrowRight") || this.inputs.isDown("KeyD")) {
            this.x += movement;
            moved = true;
        }
        if (moved) {
            this.conn.send({ type: "move", x: this.x, y: this.y });
        }
    }
    async draw(gc: CanvasRenderingContext2D, w: number, h: number) {
        gc.clearRect(0, 0, w, h);

        const viewH = (VIEW_W * h) / w;

        const idxToScreen = (ix: number, iy: number) => {
            const dx = ix - this.x;
            const dy = iy - this.y;
            const x = w * 0.5 + (w * dx) / VIEW_W;
            const y = h * 0.5 + (h * dy) / viewH;
            return { x, y };
        };

        const tileW = w / VIEW_W;
        const sX = this.x - VIEW_W * 0.5;
        const sY = this.y - viewH * 0.5;
        const eX = sX + VIEW_W;
        const eY = sY + viewH;
        const minIX = Math.floor(sX);
        const minIY = Math.floor(sY);
        const maxIX = Math.floor(eX);
        const maxIY = Math.floor(eY);
        for (let iy = minIY; iy <= maxIY; iy++) {
            for (let ix = minIX; ix <= maxIX; ix++) {
                if (
                    ix < 0 ||
                    ix >= this.map.width ||
                    iy < 0 ||
                    iy >= this.map.height
                ) {
                    continue;
                }
                const isLand = this.map.data[iy][ix];
                if (isLand) {
                    gc.fillStyle = "#4C6";
                } else {
                    gc.fillStyle = "#46C";
                }
                const { x, y } = idxToScreen(ix, iy);
                gc.fillRect(x - 1, y - 1, tileW + 2, tileW + 2);
            }
        }

        for (const player of this.players) {
            if (player.nick === this.nick) {
                continue;
            }
            const { x, y } = idxToScreen(player.x, player.y);
            gc.fillStyle = "#C11";
            gc.beginPath();
            gc.ellipse(x, y, tileW * 0.45, tileW * 0.45, 0, 0, Math.PI * 2);
            gc.closePath();
            gc.fill();
            gc.fillStyle = "#000";
            gc.font = "30px Arial";
            gc.fillText(player.nick, x + tileW * 0.5, y - tileW * 0.5);
        }
        gc.fillStyle = "#F00";
        gc.beginPath();
        gc.ellipse(
            w * 0.5,
            h * 0.5,
            tileW * 0.45,
            tileW * 0.45,
            0,
            0,
            Math.PI * 2
        );
        gc.closePath();
        gc.fill();
    }
}
