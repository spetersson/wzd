import { BB, Vec } from '@/utils/math'

export class Camera {
    private pos: Vec
    private worldSize: Vec
    private screenSize: Vec
    private scale: number
    private scaleInv: number
    private worldBB: BB
    private worldIdxBB: BB
    constructor(pos: Vec, preferedWorldSize: Vec, screenW: number, screenH: number) {
        this.update(pos, preferedWorldSize, screenW, screenH)
    }

    update(pos: Vec, preferedWorldSize: Vec, screenW: number, screenH: number) {
        this.pos = Vec(pos)
        this.worldSize = Vec()
        this.screenSize = Vec(screenW, screenH)

        const wScale = this.screenSize.x / preferedWorldSize.x
        const hScale = this.screenSize.y / preferedWorldSize.y
        this.scale = Math.round((wScale + hScale) * 0.5 * window.devicePixelRatio)
        this.scaleInv = 1 / this.scale

        this.worldSize.x = this.screenSize.x / this.scale
        this.worldSize.y = this.screenSize.y / this.scale

        const left = this.pos.x - this.worldSize.x * 0.5
        const right = left + this.worldSize.x
        const top = this.pos.y - this.worldSize.y * 0.5
        const bottom = top + this.worldSize.y
        this.worldBB = {
            left,
            right,
            top,
            bottom,
        }
        this.worldIdxBB = {
            left: Math.floor(left),
            right: Math.floor(right),
            top: Math.floor(top),
            bottom: Math.floor(bottom),
        }
    }

    getScale() {
        return this.scale
    }
    getWorldBB() {
        return this.worldBB
    }
    getWorldIdxBB() {
        return this.worldIdxBB
    }

    vecWorldToScreen(p: Vec): Vec {
        return {
            x: (p.x - this.worldBB.left) * this.scale,
            y: (p.y - this.worldBB.top) * this.scale,
        }
    }
    xyWorldToScreen(x: number, y: number): Vec {
        return {
            x: (x - this.worldBB.left) * this.scale,
            y: (y - this.worldBB.top) * this.scale,
        }
    }

    vecScreenToWorld(p: Vec): Vec {
        return {
            x: p.x * this.scaleInv + this.worldBB.left,
            y: p.y * this.scaleInv + this.worldBB.top,
        }
    }
    xyScreenToWorld(x: number, y: number): Vec {
        return {
            x: x * this.scaleInv + this.worldBB.left,
            y: y * this.scaleInv + this.worldBB.top,
        }
    }
}
