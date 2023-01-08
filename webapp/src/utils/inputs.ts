import { KeyCodes } from './keys'

export type InputCallback = (key: KeyCodes, ev: Event) => void

export default class Inputs {
    private keysDown: Partial<Record<KeyCodes, boolean>>
    private listenersDown: Partial<Record<KeyCodes, InputCallback[]>>
    private listenersUp: Partial<Record<KeyCodes, InputCallback[]>>

    constructor() {
        this.keysDown = {}
        this.listenersDown = {}
        this.listenersUp = {}
        window.onkeydown = (ev: KeyboardEvent) => {
            const code = ev.code as KeyCodes
            let callbacks: InputCallback[]
            if (!this.keysDown[code]) {
                callbacks = this.listenersDown[code]
            }
            this.keysDown[code] = true
            if (callbacks) {
                callbacks.forEach((fn) => fn(code, ev))
            }
        }
        window.onkeyup = (ev: KeyboardEvent) => {
            const code = ev.code as KeyCodes
            let callbacks: InputCallback[]
            if (this.keysDown[code]) {
                callbacks = this.listenersUp[code]
            }
            this.keysDown[code] = false
            if (callbacks) {
                callbacks.forEach((fn) => fn(code, ev))
            }
        }
    }

    isDown(code: KeyCodes) {
        return Boolean(this.keysDown[code])
    }

    listenDown(code: KeyCodes, callback: InputCallback) {
        this.listenersDown[code] = this.listenersDown[code] ? [...this.listenersDown[code], callback] : [callback]
    }
    listenUp(code: KeyCodes, callback: InputCallback) {
        this.listenersUp[code] = this.listenersUp[code] ? [...this.listenersUp[code], callback] : [callback]
    }
}
