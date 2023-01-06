import { Component } from '.'
import Connection from '../server/connection'
import Inputs from '../utils/inputs'
import { MapData } from '../utils/map'
import {
    add,
    BB,
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
import { toDouble } from '../server/types'
import {
    collidePlayerBB,
    collidePlayerPlayer,
    collidePlayerTiles,
} from '../utils/collision'

const VIEW_W = 50
const MAX_REG_SPEED = 10
const MAX_SPRINT_SPEED = 15
const ACC = 40
const SLOWDOWN = 2
const PLAYER_RAD = 0.45
const PING_INTERVAL = 500
const NUM_PINGS_AVG = 10

export default class Game extends Component {
    user: Player

    private container: HTMLDivElement
    private canvas: HTMLCanvasElement
    private sprinting: boolean
    private width: number
    private height: number
    private focused: boolean
    private debug: boolean

    private timestamp: number
    private latency: number
    private lastPing: number
    private pings: number[]
    private players: Player[]

    constructor(
        public map: MapData,
        private conn: Connection,
        private inputs: Inputs
    ) {
        super(['update', 'pong'])

        this.container = document.getElementById(
            'game-container'
        ) as HTMLDivElement
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement
        this.user = {
            username: '-',
            pos: Vec(458.8449469675175, 237.25534150650404),
            vel: Vec(),
            dir: Vec(),
        }
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
        this.user.username = username
        this.conn.send({ type: 'join', username, pos: toDouble(this.user.pos) })
    }

    receive(pkt: GetPacket) {
        switch (pkt.type) {
            case 'update':
                const user = pkt.players.find(
                    (p) => p.username === this.user.username
                )
                if (!user) {
                    console.error('Could not find player in update packet')
                }
                this.user.pos = Vec(user.pos)
                this.user.vel = Vec(user.vel)
                this.players = pkt.players.filter(
                    (p) => p.username !== this.user.username
                )

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

            case 'pong':
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
        this.collide()
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
            const delta = sub(i, this.user.pos)
            return Vec(
                w * 0.5 + (w * delta.x) / VIEW_W,
                h * 0.5 + (h * delta.y) / viewH
            )
        }

        const tileW = w / VIEW_W
        const size = Vec(VIEW_W, viewH)
        const topLeft = sub(this.user.pos, mul(size, 0.5))
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
                    if (tile.building.typeId === 1) {
                        gc.fillStyle = '#666'
                    } else {
                        gc.fillStyle = '#955'
                    }
                    gc.fillRect(
                        x + tileW * 0.05,
                        y + tileW * 0.05,
                        tileW * 0.9,
                        tileW * 0.9
                    )
                    if (tile.building.typeId === 1) {
                        gc.fillStyle = '#333'
                    } else {
                        gc.fillStyle = '#522'
                    }
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
            this.conn.send({ type: 'pong', timestamp: now })
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

        if (!eq(dir, this.user.dir) || this.sprinting != sprinting) {
            this.conn.send({ type: 'move', dir: toDouble(dir), sprinting })
        }
        this.user.dir = Vec(dir)
        this.sprinting = sprinting

        const currentSpeed = Math.sqrt(
            this.user.vel.x * this.user.vel.x +
                this.user.vel.y * this.user.vel.y
        )

        // Check if input is given
        if (!isZero(dir) && this.focused) {
            // Update velocity
            this.user.vel = mul(dir, currentSpeed + ACC * dt)

            // Limit speed
            const maxSpeed = this.sprinting ? MAX_SPRINT_SPEED : MAX_REG_SPEED
            if (currentSpeed > maxSpeed) {
                const ratio = maxSpeed / currentSpeed
                imul(this.user.vel, ratio)
            }
        } else if (!isZero(this.user.vel)) {
            // No input, slow down player
            const newSpeed = Math.max(0, currentSpeed - ACC * SLOWDOWN * dt)
            const ratio = newSpeed / currentSpeed
            imul(this.user.vel, ratio)
        }

        // Check if player is moving
        if (!isZero(this.user.vel)) {
            iadd(this.user.pos, mul(this.user.vel, dt))
        }
    }
    private collide() {
        const allPlayers = [this.user, ...this.players]
        for (let i = 0; i < allPlayers.length; i++) {
            for (let j = i + 1; j < allPlayers.length; j++) {
                collidePlayerPlayer(allPlayers[i], allPlayers[j])
            }
        }

        for (const player of allPlayers) {
            collidePlayerTiles(player, this.map)
        }
    }
}
