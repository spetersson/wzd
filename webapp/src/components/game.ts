import { Component } from '.'
import Connection from '../server/connection'
import Inputs from '../utils/inputs'
import { MapData } from '../utils/map'
import {
    add,
    dot,
    eq,
    iadd,
    imul,
    inormalize,
    isZero,
    mul,
    sub,
    Vec,
} from '../utils/math'
import { GetPacket, Player } from '../server/packet-get'

const VIEW_W = 50
const MAX_REG_SPEED = 10
const MAX_SPRINT_SPEED = 15
const ACC = 40
const SLOWDOWN = 2
const PLAYER_RAD = 0.45
const PING_INTERVAL = 500
const NUM_PINGS_AVG = 10

export default class Game extends Component {
    container: HTMLDivElement
    canvas: HTMLCanvasElement
    username: string
    pos: Vec
    vel: Vec
    dir: Vec
    sprinting: boolean
    width: number
    height: number
    focused: boolean
    debug: boolean

    timestamp: number
    latency: number
    lastPing: number
    pings: number[]
    players: Player[]

    constructor(
        private map: MapData,
        private conn: Connection,
        private inputs: Inputs
    ) {
        super(['update', 'ping'])

        this.container = document.getElementById(
            'game-container'
        ) as HTMLDivElement
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement

        this.pos = Vec(458.8449469675175, 237.25534150650404)
        this.vel = Vec()
        this.dir = Vec()
        this.sprinting = false
        this.focused = false
        this.debug = false

        this.timestamp = 0
        this.latency = 0
        this.lastPing = 0
        this.pings = []
        this.players = []

        this.resize()
        window.onresize = this.resize.bind(this)
        this.inputs.listenDown('Tab', this.onTab.bind(this))
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
        this.conn.send({ type: 'join', username, pos: this.pos })
    }

    receive(pkt: GetPacket) {
        switch (pkt.type) {
            case 'update':
                this.players = pkt.players
                const player = this.players.find(
                    (p) => p.username === this.username
                )
                if (!player) {
                    console.error('Could not find player in update packet')
                    return
                }
                this.pos = Vec(player.pos)
                this.vel = Vec(player.vel)

                for (const id in this.map.buildings) {
                    const oldBuilding = this.map.buildings[id]
                    this.map.data[oldBuilding.iy][oldBuilding.ix].building =
                        null
                }
                this.map.buildings = pkt.buildings.reduce(
                    (p, c) => ({ ...p, [c.id]: c }),
                    {}
                )
                for (const id in this.map.buildings) {
                    const newBuilding = this.map.buildings[id]
                    this.map.data[newBuilding.iy][newBuilding.ix].building =
                        newBuilding
                }

                this.timestamp = Date.now()
                break

            case 'ping':
                this.updateLatency(Date.now() - pkt.timestamp)
                break

            default:
                console.error(`Unknown packet type: ${pkt.type}`)
                return
        }
    }
    onTab(_key: string, ev: Event) {
        if (!this.focused) {
            return
        }
        ev.preventDefault()
        this.debug = !this.debug
    }
    update() {
        const now = Date.now()
        const dt = (now - this.timestamp) / 1000
        this.ping()
        this.move(dt)
        // this.collide()
        this.timestamp = now
    }
    draw() {
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
                const tile = this.map.data[iy][ix]
                if (tile.walkable) {
                    gc.fillStyle = '#4C6'
                } else {
                    gc.fillStyle = '#46C'
                }
                const { x, y } = idxToScreen(Vec(ix, iy))
                gc.fillRect(x - 1, y - 1, tileW + 2, tileW + 2)

                if (tile.building) {
                    gc.fillStyle = '#666'
                    gc.fillRect(
                        x + tileW * 0.05,
                        y + tileW * 0.05,
                        tileW * 0.9,
                        tileW * 0.9
                    )
                    gc.fillStyle = '#333'
                    gc.fillRect(
                        x + tileW * 0.15,
                        y + tileW * 0.15,
                        tileW * 0.7,
                        tileW * 0.7
                    )
                }
            }
        }

        for (const player of this.players) {
            if (player.username === this.username) {
                continue
            }
            const { x, y } = idxToScreen(player.pos)
            gc.fillStyle = '#C11'
            gc.beginPath()
            gc.ellipse(
                x,
                y,
                tileW * PLAYER_RAD,
                tileW * PLAYER_RAD,
                0,
                0,
                Math.PI * 2
            )
            gc.closePath()
            gc.fill()
            gc.fillStyle = '#000'
            gc.font = '30px Arial'
            gc.fillText(player.username, x + tileW * 0.5, y - tileW * 0.5)
        }
        gc.fillStyle = '#F00'
        gc.beginPath()
        gc.ellipse(
            w * 0.5,
            h * 0.5,
            tileW * PLAYER_RAD,
            tileW * PLAYER_RAD,
            0,
            0,
            Math.PI * 2
        )
        gc.closePath()
        gc.fill()

        if (this.debug) {
            gc.fillStyle = 'rgba(0,0,0,0.6)'
            gc.fillRect(0, 0, w, 50)
            gc.fillStyle = '#FFF'
            gc.font = '30px Arial'
            gc.fillText(`PING: ${this.latency.toFixed(0)}`, 10, 35)
        }
    }

    // Private methods
    private resize() {
        this.width = this.canvas.width = this.container.clientWidth
        this.height = this.canvas.height = this.container.clientHeight
    }
    private ping() {
        const now = Date.now()
        if (now - this.lastPing > PING_INTERVAL) {
            this.conn.send({ type: 'ping', timestamp: now })
            this.lastPing = now
        }
    }
    private updateLatency(latency: number) {
        this.pings.unshift(latency)
        this.pings = this.pings.slice(0, NUM_PINGS_AVG)
        this.latency = this.pings.reduce((p, c) => p + c) / this.pings.length
    }
    private move(dt: number) {
        const dir = Vec()
        if (this.inputs.isDown('ArrowUp') || this.inputs.isDown('KeyW')) {
            dir.y -= 1
        } else if (
            this.inputs.isDown('ArrowDown') ||
            this.inputs.isDown('KeyS')
        ) {
            dir.y += 1
        }
        if (this.inputs.isDown('ArrowLeft') || this.inputs.isDown('KeyA')) {
            dir.x -= 1
        } else if (
            this.inputs.isDown('ArrowRight') ||
            this.inputs.isDown('KeyD')
        ) {
            dir.x += 1
        }
        const sprinting = this.inputs.isDown('ShiftLeft')

        if (!eq(dir, this.dir) || this.sprinting != sprinting) {
            this.conn.send({ type: 'move', dir, sprinting })
        }
        this.dir = Vec(dir)
        this.sprinting = sprinting

        const currentSpeed = Math.sqrt(
            this.vel.x * this.vel.x + this.vel.y * this.vel.y
        )

        // Check if input is given
        if (!isZero(dir) && this.focused) {
            // Update velocity
            this.vel = mul(dir, currentSpeed + ACC * dt)

            // Limit speed
            const maxSpeed = this.sprinting ? MAX_SPRINT_SPEED : MAX_REG_SPEED
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
        }
    }
    private collide() {
        // Get index range of player bounding box
        const minI = Vec(
            Math.floor(this.pos.x - PLAYER_RAD),
            Math.floor(this.pos.y - PLAYER_RAD)
        )
        const maxI = Vec(
            Math.floor(this.pos.x + PLAYER_RAD),
            Math.floor(this.pos.x + PLAYER_RAD)
        )

        // Check all blocks in index range
        for (let ix = minI.x; ix <= maxI.x; ix++) {
            for (let iy = minI.y; iy <= maxI.y; iy++) {
                // Check if block is land
                if (this.map.data[iy][ix].walkable) {
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
                if (scalar < PLAYER_RAD) {
                    // Distance needed to move out of the block
                    const dist = PLAYER_RAD - scalar
                    iadd(this.pos, mul(lineNorm, dist))
                }
            }
        }
    }
}
