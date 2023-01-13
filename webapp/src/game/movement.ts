import { Consts } from '@/constants'
import { Player } from '@/server'
import { iadd, imul, isZero, mul } from '@/utils/math'

export function movePlayer(p: Player, dt: number) {
    const currentSpeed = Math.sqrt(p.vel.x * p.vel.x + p.vel.y * p.vel.y)

    // Check if input is given
    if (!isZero(p.dir)) {
        // Update velocity
        p.vel = mul(p.dir, currentSpeed + Consts.ACC * dt)

        // Limit speed
        const maxSpeed = p.sprinting ? Consts.MAX_SPRINT_SPEED : Consts.MAX_REG_SPEED
        if (currentSpeed > maxSpeed) {
            const ratio = maxSpeed / currentSpeed
            imul(p.vel, ratio)
        }
    } else if (!isZero(p.vel)) {
        // No input, slow down player
        const newSpeed = Math.max(0, currentSpeed - Consts.ACC * Consts.SLOWDOWN * dt)
        const ratio = newSpeed / currentSpeed
        imul(p.vel, ratio)
    }

    // Check if player is moving
    if (!isZero(p.vel)) {
        iadd(p.pos, mul(p.vel, dt))
    }
}
