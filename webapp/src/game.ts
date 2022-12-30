import WZDConnection from "./connection";
import worldMap from "./assets/world.map.json";
import Inputs from "./inputs";

const VIEW_W = 50;

export default class Game {
    x: number;
    y: number;
    conn: WZDConnection;
    inputs: Inputs;

    constructor() {
        this.x = worldMap.width * Math.random();
        this.y = worldMap.height * Math.random();
        this.inputs = new Inputs();
    }

    async join(host: string, nick: string) {
        this.conn = new WZDConnection(this.receive.bind(this));
        await this.conn.connect(host);
        this.conn.send({ type: "join", nick });
    }
    receive(data: Record<string, any>) {}
    async update() {
        if (this.inputs.isDown("ArrowUp")) {
            this.y -= 0.05;
        }
        if (this.inputs.isDown("ArrowDown")) {
            this.y += 0.05;
        }
        if (this.inputs.isDown("ArrowLeft")) {
            this.x -= 0.05;
        }
        if (this.inputs.isDown("ArrowRight")) {
            this.x += 0.05;
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
                    ix >= worldMap.width ||
                    iy < 0 ||
                    iy >= worldMap.height
                ) {
                    continue;
                }
                const isLand = worldMap.data[iy][ix];
                if (isLand) {
                    gc.fillStyle = "#0F0";
                } else {
                    gc.fillStyle = "#00F";
                }
                const { x, y } = idxToScreen(ix, iy);
                gc.fillRect(x, y, tileW, tileW);
            }
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
