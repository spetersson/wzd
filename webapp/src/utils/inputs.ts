export type InputCallback = (key: string) => void

export default class Inputs {
    private keysDown: { [key: string]: boolean }
    private listenersDown: { [key: string]: InputCallback }
    private listenersUp: { [key: string]: InputCallback }

    constructor() {
        this.keysDown = {}
        this.listenersDown = {}
        this.listenersUp = {}
        window.onkeydown = (ev: KeyboardEvent) => {
            let callback: InputCallback
            if (!this.keysDown[ev.code]) {
                callback = this.listenersDown[ev.code]
            }
            this.keysDown[ev.code] = true
            if (typeof callback === 'function') {
                callback(ev.code)
            }
        }
        window.onkeyup = (ev: KeyboardEvent) => {
            let callback: InputCallback
            if (this.keysDown[ev.code]) {
                callback = this.listenersUp[ev.code]
            }
            this.keysDown[ev.code] = false
            if (typeof callback === 'function') {
                callback(ev.code)
            }
        }
    }

    isDown(key: string) {
        return Boolean(this.keysDown[key])
    }

    listenDown(key: string, callback: InputCallback) {
        this.listenersDown[key] = callback
    }
    listenUp(key: string, callback: InputCallback) {
        this.listenersUp[key] = callback
    }
}
