import { Consts } from '@/constants'
import { Player } from '@/server/packet-get'
import { Building, isWholeTile, MapData } from '@/utils/map'
import { Vec } from '@/utils/math'

import { Camera } from './camera'
import { Enemy, InHands } from './types'

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
    const tileW = cam.getScale()
    for (let iy = worldIdxBB.top; iy <= worldIdxBB.bottom; iy++) {
        for (let ix = worldIdxBB.left; ix <= worldIdxBB.right; ix++) {
            if (ix < 0 || ix >= map.width || iy < 0 || iy >= map.height) {
                continue
            }
            const { x, y } = cam.vecWorldToScreen(Vec(ix, iy))
            const px = Math.round(x)
            const py = Math.round(y)
            const tile = map.tiles[iy][ix]
            if (isWholeTile(tile)) {
                gc.drawImage(tile.tileSprite.img, px, py, tileW, tileW)
            } else {
                const halfTileW = Math.round(tileW * 0.5)
                gc.drawImage(tile.subtileSprites[0].img, px, py, halfTileW, halfTileW)
                gc.drawImage(tile.subtileSprites[1].img, px + halfTileW, py, halfTileW, halfTileW)
                gc.drawImage(tile.subtileSprites[2].img, px, py + halfTileW, halfTileW, halfTileW)
                gc.drawImage(tile.subtileSprites[3].img, px + halfTileW, py + halfTileW, halfTileW, halfTileW)
            }

            if (tile.building) {
                drawBuilding(gc, cam, tile.building)
            }
        }
    }
}

export function drawInHands(gc: CanvasRenderingContext2D, cam: Camera, inHands: InHands, mPos: Vec) {
    if (!inHands.buildingType) {
        return
    }

    // Draw marker square
    const ix = Math.floor(mPos.x)
    const iy = Math.floor(mPos.y)
    const { x, y } = cam.xyWorldToScreen(ix, iy)
    const tileW = cam.getScale()
    if (inHands.valid) {
        gc.fillStyle = '#0F0'
    } else {
        gc.fillStyle = '#F00'
    }
    gc.globalAlpha = 0.4
    gc.fillRect(x, y, tileW, tileW)
    gc.globalAlpha = 1

    // Draw building
    const building: Building = {
        id: 0,
        ix,
        iy,
        typeId: inHands.buildingType.typeId,
    }
    drawBuilding(gc, cam, building, 0.5)
}

export function drawBuilding(gc: CanvasRenderingContext2D, cam: Camera, building: Building, alpha?: number) {
    const { x, y } = cam.xyWorldToScreen(building.ix, building.iy)
    const tileW = cam.getScale()
    const type = Consts.BUILDING_TYPES[building.typeId]
    const offset = (1 - type.size) * 0.5
    gc.globalAlpha = typeof alpha === 'number' ? alpha : 1
    if (building.typeId === 1) {
        gc.fillStyle = '#666'
    } else {
        gc.fillStyle = '#955'
    }
    gc.fillRect(x + tileW * offset, y + tileW * offset, tileW * type.size, tileW * type.size)
    if (building.typeId === 1) {
        gc.fillStyle = '#333'
    } else {
        gc.fillStyle = '#522'
    }
    gc.fillRect(x + tileW * 0.2, y + tileW * 0.2, tileW * 0.6, tileW * 0.6)
    gc.globalAlpha = 1
}
export function drawEnemy(gc: CanvasRenderingContext2D, cam: Camera, e: Enemy) {
    const tileW = cam.getScale()
    const { x, y } = cam.vecWorldToScreen(e.pos)
    gc.fillStyle = '#933'
    gc.beginPath()
    gc.ellipse(x, y, tileW * Consts.PLAYER_RAD, tileW * Consts.PLAYER_RAD, 0, 0, Math.PI * 2)
    gc.closePath()
    gc.fill()
}

export function drawPlayer(gc: CanvasRenderingContext2D, cam: Camera, p: Player) {
    const tileW = cam.getScale()
    const { x, y } = cam.vecWorldToScreen(p.pos)
    gc.fillStyle = '#339'
    gc.beginPath()
    gc.ellipse(x, y, tileW * Consts.PLAYER_RAD, tileW * Consts.PLAYER_RAD, 0, 0, Math.PI * 2)
    gc.closePath()
    gc.fill()
    gc.fillStyle = '#000'
    gc.font = '30px Arial'
    gc.fillText(p.username, x + tileW * 0.5, y - tileW * 0.5)
}

export function drawUser(gc: CanvasRenderingContext2D, cam: Camera, p: Player) {
    const scale = cam.getScale()
    const { x, y } = cam.vecWorldToScreen(p.pos)
    gc.fillStyle = '#44C'
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
