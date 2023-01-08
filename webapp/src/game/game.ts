import { Receiver } from '@/components'
import { Consts } from '@/constants'
import Connection from '@/server/connection'
import { GetPacket, Player } from '@/server/packet-get'
import { toDouble } from '@/server/types'
import Inputs from '@/utils/inputs'
import { KeyCodes } from '@/utils/keys'
import { getWorldMap, MapData } from '@/utils/map'
import { eq, isZero, Vec } from '@/utils/math'

import {
    Camera,
    collidePlayerPlayer,
    collidePlayerTiles,
    drawDebug,
    drawLoading,
    drawMap,
    drawPlayer,
    drawUser,
    movePlayer,
    BuildMenu,
} from '.'

export default class Game extends Receiver {
    user: Player
    players: Player[]
    map: MapData
    cam: Camera
    buildMenu: BuildMenu

    container: HTMLDivElement
    canvas: HTMLCanvasElement
    loaded: boolean
    focused: boolean
    debug: boolean

    timestamp: number
    latency: number
    lastPing: number
    pings: number[]

    constructor(public conn: Connection, public inputs: Inputs) {
        super(['update', 'pong', 'map'])
        this.container = document.getElementById('game-container') as HTMLDivElement
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement

        this.user = {
            username: '-',
            pos: Vec(458.8449469675175, 237.25534150650404),
            vel: Vec(),
            dir: Vec(),
            sprinting: false,
        }
        this.players = []
        this.map = { width: 0, height: 0, buildings: {}, tiles: [], tileSprites: {} }
        this.cam = new Camera(Vec(this.user.pos), Consts.PREFERED_VIEW_SIZE, this.canvas.width, this.canvas.height)
        this.buildMenu = new BuildMenu(conn, this)
        this.buildMenu.hide()

        this.loaded = false
        this.focused = false
        this.debug = false

        this.timestamp = 0
        this.latency = 0
        this.lastPing = 0
        this.pings = []
    }

    init() {
        this.resize()
        window.onresize = this.resize.bind(this)
        this.inputs.listenDown('Tab', this.onTab.bind(this))
        this.inputs.listenDown('KeyE', this.onKeyE.bind(this))
    }

    unfocus() {
        this.focused = false
    }

    focus() {
        this.focused = true
    }
    show() {
        this.container.style.display = 'block'
    }
    hide() {
        this.container.style.display = 'none'
    }

    async join(username: string) {
        this.user.username = username
        this.conn.send({ type: 'join', username, pos: toDouble(this.user.pos) })
    }

    async receive(pkt: GetPacket) {
        switch (pkt.type) {
            case 'update':
                if (!this.loaded) {
                    break
                }
                const user = pkt.players.find((p) => p.username === this.user.username)
                if (!user) {
                    console.error('Could not find player in update packet')
                }
                this.user.pos = Vec(user.pos)
                this.user.vel = Vec(user.vel)
                this.players = pkt.players.filter((p) => p.username !== this.user.username)

                for (const id in this.map.buildings) {
                    const oldBuilding = this.map.buildings[id]
                    this.map.tiles[oldBuilding.iy][oldBuilding.ix].building = null
                }
                this.map.buildings = pkt.buildings.reduce((p, c) => ({ ...p, [c.id]: c }), {})
                for (const id in this.map.buildings) {
                    const newBuilding = this.map.buildings[id]
                    this.map.tiles[newBuilding.iy][newBuilding.ix].building = newBuilding
                }

                this.timestamp = Date.now()
                break

            case 'map':
                this.map = await getWorldMap(pkt.bytes.buffer, pkt.width, pkt.height)
                this.loaded = true
                break

            case 'pong':
                this.updateLatency(Date.now() - pkt.timestamp)
                break

            default:
                console.error(`Unknown packet type: ${pkt.type}`)
                return
        }
    }
    onTab(_key: KeyCodes, ev: Event) {
        if (!this.focused) {
            return
        }
        ev.preventDefault()
        this.debug = !this.debug
    }
    onKeyE(_key: KeyCodes, _ev: Event) {
        if (!this.focused) {
            return
        }
        this.buildMenu.toogle()
    }
    update() {
        if (!this.loaded) {
            return
        }
        const now = Date.now()
        const dt = (now - this.timestamp) / 1000
        this.ping()
        this.getInputs()
        this.move(dt)
        this.collide()
        this.timestamp = now
    }
    draw() {
        if (!this.loaded) {
            return
        }
        this.cam.update(this.user.pos, Consts.PREFERED_VIEW_SIZE, this.canvas.width, this.canvas.height)

        const gc = this.canvas.getContext('2d')
        gc.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (!this.loaded) {
            drawLoading(gc)
            return
        }

        drawMap(gc, this.cam, this.map)

        for (const player of this.players) {
            drawPlayer(gc, this.cam, player)
        }

        drawUser(gc, this.cam, this.user)

        if (this.debug) {
            const connStats = this.conn.getStats()
            drawDebug(gc, this.user, this.latency, connStats.receivePerSecond, connStats.sendPerSecond)
        }
    }

    // Private methods
    private resize() {
        this.canvas.width = this.container.clientWidth
        this.canvas.height = this.container.clientHeight
        this.cam.update(this.user.pos, Consts.PREFERED_VIEW_SIZE, this.canvas.width, this.canvas.height)
    }

    private ping() {
        const now = Date.now()
        if (now - this.lastPing > Consts.PING_INTERVAL) {
            this.conn.send({ type: 'ping', timestamp: now })
            this.lastPing = now
        }
    }

    private updateLatency(latency: number) {
        this.pings.unshift(latency)
        this.pings.splice(Consts.NUM_PINGS_AVG)
        this.latency = this.pings.reduce((p, c) => p + c) / this.pings.length
    }

    private getInputs() {
        if (!this.focused) {
            if (!isZero(this.user.dir)) {
                this.user.dir = Vec()
                this.conn.send({ type: 'move', dir: toDouble(Vec()), sprinting: false })
            }
            return
        }
        const dir = Vec()
        if (this.inputs.isDown('ArrowUp') || this.inputs.isDown('KeyW')) {
            dir.y -= 1
        } else if (this.inputs.isDown('ArrowDown') || this.inputs.isDown('KeyS')) {
            dir.y += 1
        }
        if (this.inputs.isDown('ArrowLeft') || this.inputs.isDown('KeyA')) {
            dir.x -= 1
        } else if (this.inputs.isDown('ArrowRight') || this.inputs.isDown('KeyD')) {
            dir.x += 1
        }
        const sprinting = this.inputs.isDown('ShiftLeft')

        if (!eq(dir, this.user.dir) || this.user.sprinting != sprinting) {
            this.conn.send({ type: 'move', dir: toDouble(dir), sprinting })
        }
        this.user.dir = Vec(dir)
        this.user.sprinting = sprinting
    }

    private move(dt: number) {
        const allPlayers = [this.user, ...this.players]
        for (const player of allPlayers) {
            movePlayer(player, dt)
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
