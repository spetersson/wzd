import { Consts } from '@/constants'
import { isWholeTile, MapData } from '@/map'
import { Vec } from '@/utils/math'
import { Camera } from './camera'
import { drawMap } from './draw'

export class Minimap {
    cam: Camera
    canvas: HTMLCanvasElement

    constructor(pos: Vec, width: number, height: number) {
        this.canvas = document.getElementById('minimap') as HTMLCanvasElement
        this.canvas.width = width
        this.canvas.height = height
        this.cam = new Camera(pos, Consts.MINIMAP_VIEW_SIZE, width, height)
    }

    update(pos: Vec, width: number, height: number) {
        this.canvas.width = width
        this.canvas.height = height
        this.cam.update(pos, Consts.MINIMAP_VIEW_SIZE, width, height)
    }

    draw(map: MapData) {
        const gc = this.canvas.getContext('2d')
        const worldIdxBB = this.cam.getWorldIdxBB()
        const tileW = this.cam.getScale()
        for (let iy = worldIdxBB.top; iy <= worldIdxBB.bottom; iy++) {
            for (let ix = worldIdxBB.left; ix <= worldIdxBB.right; ix++) {
                if (!map.isInside(ix, iy)) {
                    continue
                }
                const { x, y } = this.cam.vecWorldToScreen(Vec(ix, iy))
                const px = Math.round(x)
                const py = Math.round(y)

                const tile = map.tiles[iy][ix]
                if (tile.building) {
                    gc.fillStyle = '#4D4835'
                } else if (tile.walkable) {
                    gc.fillStyle = '#449559'
                } else {
                    gc.fillStyle = '#114A72'
                }

                gc.fillRect(px, py, tileW, tileW)
            }
        }
    }
}
