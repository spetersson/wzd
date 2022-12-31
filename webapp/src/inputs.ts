export default class Inputs {
    private keysDown: { [key: string]: true };

    constructor() {
        this.keysDown = {};
        window.onkeydown = (ev: KeyboardEvent) => {
            this.keysDown[ev.code] = true;
        };
        window.onkeyup = (ev: KeyboardEvent) => {
            delete this.keysDown[ev.code];
        };
    }

    isDown(keyCode: string) {
        return Boolean(this.keysDown[keyCode]);
    }
}
