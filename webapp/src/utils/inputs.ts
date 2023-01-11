import { Vec } from '@/utils/math'

import { KeyCodes } from '.'

export type KeyboardCallback = (key: KeyCodes, ev: Event) => void
export type MouseCallback = (ev: MouseEvent) => void
export type MouseEvents = 'leftclick' | 'rightclick' | 'move'

enum ButtonCodes {
    LEFT_BTN = 0,
    SCROLL_BTN = 1,
    RIGHT_BTN = 2,
}

export class Inputs {
    private keysDown: Partial<Record<KeyCodes, boolean>>
    private listenersKeyDown: Partial<Record<KeyCodes, KeyboardCallback[]>>
    private listenersKeyUp: Partial<Record<KeyCodes, KeyboardCallback[]>>
    private listenersMouse: Record<MouseEvents, MouseCallback[]>
    private mousePos: Vec

    constructor() {
        this.keysDown = {}
        this.listenersKeyDown = {}
        this.listenersKeyUp = {}
        this.listenersMouse = {
            leftclick: [],
            rightclick: [],
            move: [],
        }
        this.mousePos = Vec()

        window.onkeydown = (ev) => {
            const code = ev.code as KeyCodes
            let callbacks: KeyboardCallback[]
            if (!this.keysDown[code]) {
                callbacks = this.listenersKeyDown[code]
            }
            this.keysDown[code] = true
            if (callbacks) {
                callbacks.forEach((fn) => fn(code, ev))
            }
        }
        window.onkeyup = (ev) => {
            const code = ev.code as KeyCodes
            let callbacks: KeyboardCallback[]
            if (this.keysDown[code]) {
                callbacks = this.listenersKeyUp[code]
            }
            this.keysDown[code] = false
            if (callbacks) {
                callbacks.forEach((fn) => fn(code, ev))
            }
        }
        document.body.onmousemove = (ev) => {
            this.mousePos.x = ev.clientX
            this.mousePos.y = ev.clientY
            this.listenersMouse.move.forEach((fn) => fn(ev))
        }
        document.body.onmousedown = (ev) => {
            if (ev.button === ButtonCodes.LEFT_BTN) {
                this.listenersMouse.leftclick.forEach((fn) => fn(ev))
            } else if (ev.button === ButtonCodes.RIGHT_BTN) {
                if (this.listenersMouse.rightclick.length > 0) {
                    ev.preventDefault()
                    this.listenersMouse.rightclick.forEach((fn) => fn(ev))
                }
            }
        }
    }

    isKeyDown(code: KeyCodes) {
        return Boolean(this.keysDown[code])
    }

    onKeyDown(code: KeyCodes, callback: KeyboardCallback) {
        if (!this.listenersKeyDown[code]) {
            this.listenersKeyDown[code] = []
        }
        this.listenersKeyDown[code].push(callback)
    }

    onKeyUp(code: KeyCodes, callback: KeyboardCallback) {
        if (!this.listenersKeyUp[code]) {
            this.listenersKeyUp[code] = []
        }
        this.listenersKeyUp[code].push(callback)
    }

    onMouse(type: MouseEvents, callback: MouseCallback) {
        this.listenersMouse[type].push(callback)
    }

    getMouseScreenPos(): Vec {
        return Vec(this.mousePos)
    }
}
