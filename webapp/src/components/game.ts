import { Component } from '.'
import Connection from '../server/connection'
import Inputs from '../utils/inputs'
import { MapData } from '../utils/map'
import {
    add,
    dot,
    iadd,
    imul,
    inormalize,
    isZero,
    mul,
    sub,
    Vec,
} from '../utils/math'
import { GetPackage, Player } from '../server/packages-get'

const VIEW_W = 50
const MAX_REG_SPEED = 10
const MAX_SPRINT_SPEED = 15
const ACC = 40
const SLOWDOWN = 2
const playerRad = 0.45

export default class Game extends Component {
    container: HTMLDivElement
    canvas: HTMLCanvasElement
    username: string
    pos: Vec
    vel: Vec
    width: number
    height: number
    focused: boolean

    players: Player[]

    constructor(
        private map: MapData,
        private conn: Connection,
        private inputs: Inputs
    ) {
        super()

        this.container = document.getElementById(
            'game-container'
        ) as HTMLDivElement
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement

        this.pos = Vec(458.8449469675175, 237.25534150650404)
        this.vel = Vec(0, 0)
        this.focused = false
        this.players = []

        this.resize()
        window.onresize = this.resize.bind(this)
    }

    _unfocus() {
        this.focused = false
    }

    _focus() {
        this.focused = true
    }
    _show() {
        this.container.style.display = 'block'
        this.resize()
    }
    _hide() {
        this.container.style.display = 'none'
    }

    async join(username: string) {
        this.username = username
        this.conn.send({ type: 'join', username, x: this.pos.x, y: this.pos.y })
    }

    receive(pkg: GetPackage) {
        if (pkg.type === 'update') {
            this.players = pkg.players
        }
    }
    async update(dt: number) {
        this.move(dt)
        this.collide()
    }
    async draw() {
        const w = this.width
        const h = this.height
        if (w === 0 || h === 0) {
            return
        }

        const gc = this.canvas.getContext('2d')
        gc.clearRect(0, 0, w, h)

        const viewH = (VIEW_W * h) / w

        const idxToScreen = (i: Vec) => {
            const delta = sub(i, this.pos)
            return Vec(
                w * 0.5 + (w * delta.x) / VIEW_W,
                h * 0.5 + (h * delta.y) / viewH
            )
        }

        const tileW = w / VIEW_W
        const size = Vec(VIEW_W, viewH)
        const topLeft = sub(this.pos, mul(size, 0.5))
        const botRight = add(topLeft, size)
        const minI = Vec(Math.floor(topLeft.x), Math.floor(topLeft.y))
        const maxI = Vec(Math.floor(botRight.x), Math.floor(botRight.y))
        for (let iy = minI.y; iy <= maxI.y; iy++) {
            for (let ix = minI.x; ix <= maxI.x; ix++) {
                if (
                    ix < 0 ||
                    ix >= this.map.width ||
                    iy < 0 ||
                    iy >= this.map.height
                ) {
                    continue
                }
                const isLand = this.map.data[iy][ix]
                if (isLand) {
                    gc.fillStyle = '#4C6'
                } else {
                    gc.fillStyle = '#46C'
                }
                const { x, y } = idxToScreen(Vec(ix, iy))
                gc.fillRect(x - 1, y - 1, tileW + 2, tileW + 2)
            }
        }

        for (const player of this.players) {
            if (player.nick === this.username) {
                continue
            }
            const { x, y } = idxToScreen(player)
            gc.fillStyle = '#C11'
            gc.beginPath()
            gc.ellipse(
                x,
                y,
                tileW * playerRad,
                tileW * playerRad,
                0,
                0,
                Math.PI * 2
            )
            gc.closePath()
            gc.fill()
            gc.fillStyle = '#000'
            gc.font = '30px Arial'
            gc.fillText(player.nick, x + tileW * 0.5, y - tileW * 0.5)
        }
        gc.fillStyle = '#F00'
        gc.beginPath()
        gc.ellipse(
            w * 0.5,
            h * 0.5,
            tileW * playerRad,
            tileW * playerRad,
            0,
            0,
            Math.PI * 2
        )
        gc.closePath()
        gc.fill()
    }

    // Private methods
    private resize() {
        this.width = this.canvas.width = this.container.clientWidth
        this.height = this.canvas.height = this.container.clientHeight
    }
    private move(dt: number) {
        const delta = Vec()
        if (this.inputs.isDown('ArrowUp') || this.inputs.isDown('KeyW')) {
            delta.y -= 1
        } else if (
            this.inputs.isDown('ArrowDown') ||
            this.inputs.isDown('KeyS')
        ) {
            delta.y += 1
        }
        if (this.inputs.isDown('ArrowLeft') || this.inputs.isDown('KeyA')) {
            delta.x -= 1
        } else if (
            this.inputs.isDown('ArrowRight') ||
            this.inputs.isDown('KeyD')
        ) {
            delta.x += 1
        }

        const currentSpeed = Math.sqrt(
            this.vel.x * this.vel.x + this.vel.y * this.vel.y
        )

        // Check if input is given
        if (!isZero(delta) && this.focused) {
            // Normalize delta vector if needed
            if (delta.x !== 0 && delta.y !== 0) {
                inormalize(delta)
            }

            // Update velocity
            this.vel = mul(delta, currentSpeed + ACC * dt)

            // Limit speed
            const maxSpeed = this.inputs.isDown('ShiftLeft')
                ? MAX_SPRINT_SPEED
                : MAX_REG_SPEED
            if (currentSpeed > maxSpeed) {
                const ratio = maxSpeed / currentSpeed
                imul(this.vel, ratio)
            }
        } else if (!isZero(this.vel)) {
            // No input, slow down player
            const newSpeed = Math.max(0, currentSpeed - ACC * SLOWDOWN * dt)
            const ratio = newSpeed / currentSpeed
            imul(this.vel, ratio)
        }

        // Check if player is moving
        if (!isZero(this.vel)) {
            iadd(this.pos, mul(this.vel, dt))
            this.conn.send({ type: 'move', x: this.pos.x, y: this.pos.y })
        }
    }
    private collide() {
        // Get index range of player bounding box
        const minI = Vec(
            Math.floor(this.pos.x - playerRad),
            Math.floor(this.pos.y - playerRad)
        )
        const maxI = Vec(
            Math.floor(this.pos.x + playerRad),
            Math.floor(this.pos.x + playerRad)
        )

        // Check all blocks in index range
        for (let ix = minI.x; ix <= maxI.x; ix++) {
            for (let iy = minI.y; iy <= maxI.y; iy++) {
                // Check if block is land
                if (this.map.data[iy][ix]) {
                    continue
                }
                const delta = sub(this.pos, Vec(ix + 0.5, iy + 0.5))
                // Line to collide with
                let linePos: Vec
                let lineNorm: Vec
                if (Math.abs(delta.x) >= 0.5 && Math.abs(delta.y) > 0.5) {
                    // Corner collision
                    linePos = Vec(
                        ix + Math.max(0, Math.sign(delta.x)),
                        iy + Math.max(0, Math.sign(delta.y))
                    )
                    lineNorm = sub(this.pos, linePos)
                    inormalize(lineNorm)
                } else {
                    // Side collision
                    if (delta.x > 0.5) {
                        linePos = Vec(ix + 1, iy)
                        lineNorm = Vec(1, 0)
                    } else if (delta.x < -0.5) {
                        linePos = Vec(ix, iy)
                        lineNorm = Vec(-1, 0)
                    } else if (delta.y > 0.5) {
                        linePos = Vec(ix, iy + 1)
                        lineNorm = Vec(0, 1)
                    } else if (delta.y < -0.5) {
                        linePos = Vec(ix, iy)
                        lineNorm = Vec(0, -1)
                    }
                }

                // Project player onto line normal
                const relPos = sub(this.pos, linePos)
                const scalar = dot(relPos, lineNorm)
                // scalar is the distance from the block to the player

                // Check if player is inside block
                if (scalar < playerRad) {
                    // Distance needed to move out of the block
                    const dist = playerRad - scalar
                    iadd(this.pos, mul(lineNorm, dist))
                }
            }
        }
    }
}
