import { Consts } from '@/constants'
import { Player } from '@/server/packet-get'
import { isWholeTile, MapData } from '@/utils/map'
import { Vec } from '@/utils/math'

import { Camera } from './camera'

export function drawLoading(gc: CanvasRenderingContext2D) {
    gc.fillStyle = '#AAA'
    gc.fillRect(0, 0, gc.canvas.width, gc.canvas.height)

    const mX = gc.canvas.width * 0.5
    const mY = gc.canvas.height * 0.5

    const msg = 'Loading...'
    gc.font = 'bold 40px Arial'
    const metrics = gc.measureText(msg)

    gc.fillStyle = '#000'
    gc.fillText(
        msg,
        mX - (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) * 0.5,
        mY - (metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent) * 0.5
    )
}

export function drawMap(gc: CanvasRenderingContext2D, cam: Camera, map: MapData) {
    const worldIdxBB = cam.getWorldIdxBB()
    const scale = cam.getScale()
    for (let iy = worldIdxBB.top; iy <= worldIdxBB.bottom; iy++) {
        for (let ix = worldIdxBB.left; ix <= worldIdxBB.right; ix++) {
            if (ix < 0 || ix >= map.width || iy < 0 || iy >= map.height) {
                continue
            }
            const { x, y } = cam.worldToScreen(Vec(ix, iy))
            const px = Math.round(x)
            const py = Math.round(y)
            const tile = map.tiles[iy][ix]
            if (isWholeTile(tile)) {
                gc.drawImage(tile.tileSprite.img, px, py, scale, scale)
            } else {
                const halfTileW = Math.round(scale * 0.5)
                gc.drawImage(tile.subtileSprites[0].img, px, py, halfTileW, halfTileW)
                gc.drawImage(tile.subtileSprites[1].img, px + halfTileW, py, halfTileW, halfTileW)
                gc.drawImage(tile.subtileSprites[2].img, px, py + halfTileW, halfTileW, halfTileW)
                gc.drawImage(tile.subtileSprites[3].img, px + halfTileW, py + halfTileW, halfTileW, halfTileW)
            }

            // TODO: use drawBuilding to render buildings
            if (tile.building) {
                if (tile.building.typeId === 1) {
                    gc.fillStyle = '#666'
                } else {
                    gc.fillStyle = '#955'
                }
                gc.fillRect(x + scale * 0.1, y + scale * 1, scale * 0.8, scale * 0.8)
                if (tile.building.typeId === 1) {
                    gc.fillStyle = '#333'
                } else {
                    gc.fillStyle = '#522'
                }
                gc.fillRect(x + scale * 0.2, y + scale * 0.2, scale * 0.6, scale * 0.6)
            }
        }
    }
}
export function drawBuilding(gc: CanvasRenderingContext2D, cam: Camera) {
    // TODO: Implement dynamic bulding render
}
export function drawPlayer(gc: CanvasRenderingContext2D, cam: Camera, p: Player) {
    const scale = cam.getScale()
    const { x, y } = cam.worldToScreen(p.pos)
    gc.fillStyle = '#C11'
    gc.beginPath()
    gc.ellipse(x, y, scale * Consts.PLAYER_RAD, scale * Consts.PLAYER_RAD, 0, 0, Math.PI * 2)
    gc.closePath()
    gc.fill()
    gc.fillStyle = '#000'
    gc.font = '30px Arial'
    gc.fillText(p.username, x + scale * 0.5, y - scale * 0.5)
}
export function drawUser(gc: CanvasRenderingContext2D, cam: Camera, p: Player) {
    const scale = cam.getScale()
    const { x, y } = cam.worldToScreen(p.pos)
    gc.fillStyle = '#F00'
    gc.beginPath()
    gc.ellipse(x, y, scale * Consts.PLAYER_RAD, scale * Consts.PLAYER_RAD, 0, 0, Math.PI * 2)
    gc.closePath()
    gc.fill()
}
export function drawDebug(
    gc: CanvasRenderingContext2D,
    user: Player,
    latency: number,
    receivePerSec: number,
    sendPerSec: number
) {
    // Draw dark box
    gc.fillStyle = 'rgba(0,0,0,0.6)'
    gc.fillRect(0, 0, gc.canvas.width, 50)

    gc.fillStyle = '#FFF'
    gc.font = '20px Arial'

    // Draw ping
    gc.fillText(`PING: ${latency.toFixed(0)}`, 10, 31)

    // Draw receive per sec
    gc.fillText(`RECEIVES: ${(receivePerSec / 1000).toFixed(0)}Kb/s`, 150, 31)

    // Draw send per sec
    gc.fillText(`SENDS: ${(sendPerSec / 1000).toFixed(0)}Kb/s`, 400, 31)

    // Draw pos
    gc.fillText(`POS: (${user.pos.x.toFixed(1)}, ${user.pos.y.toFixed(1)})`, 650, 31)
}
