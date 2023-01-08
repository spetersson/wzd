import { Consts } from '@/constants'
import { Player } from '@/server/packet-get'
import { MapData } from '@/utils/map'
import { add, BB, dot, iadd, inormalize, isZero, mag, mul, normalized, sub, Vec } from '@/utils/math'

export function collidePlayerTiles(p: Player, map: MapData) {
    // Get index range of player bounding box
    const minI = Vec(Math.floor(p.pos.x - Consts.PLAYER_RAD), Math.floor(p.pos.y - Consts.PLAYER_RAD))
    const maxI = Vec(Math.floor(p.pos.x + Consts.PLAYER_RAD), Math.floor(p.pos.x + Consts.PLAYER_RAD))

    // Check all blocks in index range
    for (let ix = minI.x; ix <= maxI.x; ix++) {
        for (let iy = minI.y; iy <= maxI.y; iy++) {
            if (ix < 0 || ix >= map.width || iy < 0 || iy >= map.height) {
                continue
            }

            const tile = map.tiles[iy][ix]
            let bb: BB = null
            // Check if block is land
            if (!tile.walkable) {
                bb = {
                    left: ix,
                    right: ix + 1,
                    top: iy,
                    bottom: iy + 1,
                }
            } else if (tile.building) {
                const type = Consts.BUILDING_TYPES[tile.building.typeId]
                const diff = (1 - type.size) * 0.5
                bb = {
                    left: ix + diff,
                    right: ix + 1 - diff,
                    top: iy + diff,
                    bottom: iy + 1 - diff,
                }
            }

            if (bb) {
                collidePlayerBB(p, bb)
            }
        }
    }
}

export function collidePlayerBB(p: Player, bb: BB) {
    const halfW = (bb.right - bb.left) * 0.5
    const halfH = (bb.bottom - bb.top) * 0.5
    const bbMid = Vec(bb.left + halfW, bb.top + halfH)
    const delta = sub(p.pos, bbMid)
    const signDelta = Vec(Math.sign(delta.x), Math.sign(delta.y))
    // Line to collide with
    let linePos: Vec
    let lineNorm: Vec
    if (Math.abs(delta.x) >= halfW && Math.abs(delta.y) > halfH) {
        // Corner collision
        linePos = add(bbMid, Vec(signDelta.x * halfW, signDelta.y * halfH))
        lineNorm = sub(p.pos, linePos)
        inormalize(lineNorm)
    } else if (Math.abs(delta.x) > Math.abs(delta.y)) {
        // Horizontal
        linePos = Vec(bbMid.x + signDelta.x * halfW, bbMid.y)
        lineNorm = Vec(signDelta.x, 0)
    } else {
        // Vertical
        linePos = Vec(bbMid.x, bbMid.y + signDelta.y * halfH)
        lineNorm = Vec(0, signDelta.y)
    }

    // Project player onto line normal
    const relPos = sub(p.pos, linePos)
    const scalar = dot(relPos, lineNorm)
    // scalar is the distance from the block to the player

    // Check if player is inside block
    if (scalar < Consts.PLAYER_RAD) {
        // Distance needed to move out of the block
        const dist = Consts.PLAYER_RAD - scalar
        iadd(p.pos, mul(lineNorm, dist))
    }
}

export function collidePlayerPlayer(pA: Player, pB: Player) {
    const delta = sub(pB.pos, pA.pos)
    const overlap = 2 * Consts.PLAYER_RAD - mag(delta)

    // Check if they are colliding
    if (overlap < 0) {
        return
    }

    // Calculate how much to move each player, the one with higher speed moves more
    const velA = mag(pA.vel)
    const velB = mag(pB.vel)
    let weightA: number
    let weightB: number
    if (velA === 0 && velB === 0) {
        weightA = 0.5
        weightB = 0.5
    } else {
        const velTotInv = 1 / (velA + velB)
        weightA = velA * velTotInv
        weightB = velB * velTotInv
    }

    // Move players
    if (isZero(delta)) {
        // In case players are exactly on top of each other
        pA.pos.y -= Consts.PLAYER_RAD * 0.5
        pB.pos.y += Consts.PLAYER_RAD * 0.5
    } else {
        const deltaNorm = normalized(delta)
        iadd(pA.pos, mul(deltaNorm, -overlap * weightA))
        iadd(pB.pos, mul(deltaNorm, overlap * weightB))
    }
}
