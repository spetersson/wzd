import { Receiver } from '@/components'
import { Consts } from '@/constants'
import { MapData } from '@/map'
import { Inputs, KeyCodes } from '@/utils'
import { Connection, GetPacket, Player, toDouble, toInt32 } from '@/server'
import { eq, isZero, mag, normalized, sub, Vec } from '@/utils/math'

import {
    BuildMenu,
    Camera,
    collidePlayerPlayer,
    collidePlayerTiles,
    drawDebug,
    drawInHands,
    drawLoading,
    drawMap,
    drawPlayer,
    drawUser,
    InHands,
    movePlayer,
    MuteMenu,
    Sound,
    Sounds,
} from '.'

export default class Game extends Receiver {
    user: Player
    players: Player[]
    map: MapData
    cam: Camera
    buildMenu: BuildMenu
    muteMeny: MuteMenu
    sound: Sound
    inHands?: InHands
    timeSinceStep: number

    container: HTMLDivElement
    canvas: HTMLCanvasElement
    loaded: boolean
    focused: boolean
    inMenu: boolean
    debug: boolean

    latestServerUpdate: number
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
        this.map = null
        this.cam = new Camera(Vec(this.user.pos), Consts.PREFERED_VIEW_SIZE, this.canvas.width, this.canvas.height)
        this.buildMenu = new BuildMenu()
        this.buildMenu.close()
        this.sound = new Sound()
        this.muteMeny = new MuteMenu(this.sound)
        this.inHands = {}
        this.timeSinceStep = 0

        this.loaded = false
        this.focused = false
        this.inMenu = false
        this.debug = false

        this.latestServerUpdate = 0
        this.latency = 0
        this.lastPing = 0
        this.pings = []
    }

    init(username: string) {
        this.user.username = username
        this.resize()
        window.onresize = this.resize.bind(this)
        this.inputs.onKeyDown('Tab', this.onTab.bind(this))
        this.inputs.onKeyDown('KeyE', this.onKeyE.bind(this))
        this.inputs.onKeyDown('KeyQ', this.onKeyQ.bind(this))
        this.inputs.onMouse('leftclick', this.onLeftClick.bind(this))
        this.inputs.onMouse('rightclick', this.onRightClick.bind(this))
    }

    unfocus() {
        this.focused = false
        document.body.oncontextmenu = undefined
    }

    focus() {
        this.focused = true
        document.body.oncontextmenu = () => false
    }
    show() {
        this.container.style.display = 'block'
    }
    hide() {
        this.container.style.display = 'none'
    }

    async join() {
        this.conn.send({ type: 'join', username: this.user.username, pos: toDouble(this.user.pos) })
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
                this.map.replaceBuildings(pkt.buildings)
                this.latestServerUpdate = Date.now()
                break

            case 'map':
                this.map = await MapData.createWorldMap(pkt.bytes.buffer, pkt.width, pkt.height)
                this.loaded = true
                this.sound.play(Sounds.START_GAME)
                this.sound.play(Sounds.SONG_1, { delayMs: 1000, loop: true })
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
        if (this.buildMenu.status === 'closed') {
            this.inMenu = true
            this.buildMenu.selectBuilding((buildingType) => {
                this.inHands.buildingType = buildingType
                this.buildMenu.close()
                this.inMenu = false
            })
        } else {
            this.buildMenu.close()
            this.inMenu = false
        }
    }
    onKeyQ(_key: KeyCodes, _ev: Event) {
        if (!this.focused || this.inMenu) {
            return
        }

        const mScreenPos = this.inputs.getMouseScreenPos()
        const mPos = this.cam.vecScreenToWorld(mScreenPos)
        const ix = Math.floor(mPos.x)
        const iy = Math.floor(mPos.y)

        if (!this.map.isInside(ix, iy)) {
            return
        }

        const building = this.map.tiles[iy][ix].building
        if (!building) {
            this.inHands.buildingType = null
            this.inHands.valid = null
            return
        }

        this.inHands.buildingType = Consts.BUILDING_TYPES[building.typeId]
        this.inHands.valid = false
    }
    onLeftClick(ev: MouseEvent) {
        if (!this.focused || this.inMenu) {
            return
        }

        if (this.inHands.buildingType) {
            this.updateInHands()
            if (!this.inHands.valid) {
                return
            }
            const type = this.inHands.buildingType
            const mPos = this.inputs.getMouseScreenPos()
            const { x, y } = this.cam.vecScreenToWorld(mPos)
            const ix = Math.floor(x)
            const iy = Math.floor(y)

            console.log(`Placing ${type.name} of type ${type.typeId} at (${ix},${iy})`)
            this.conn.send({ type: 'build', idx: toInt32(Vec(ix, iy)), typeId: toInt32(type.typeId) })
            this.sound.play(Sounds.PLACE_BUILDING, { restart: true })
        }
    }
    onRightClick(ev: MouseEvent) {
        if (!this.focused) {
            return
        }

        if (this.inHands.buildingType) {
            this.inHands.buildingType = null
            this.inHands.valid = null
        }
    }

    frame() {
        if (!this.loaded) {
            return
        }
        this.update()
        this.draw()
    }

    update() {
        const now = Date.now()
        const dt = (now - this.latestServerUpdate) / 1000
        this.ping()
        this.getInputs()
        this.move(dt)
        this.collide()
        this.step(dt)

        this.cam.update(this.user.pos, Consts.PREFERED_VIEW_SIZE, this.canvas.width, this.canvas.height)

        this.updateInHands()
        this.latestServerUpdate = now
    }

    draw() {
        const mScreenPos = this.inputs.getMouseScreenPos()
        const mPos = this.cam.vecScreenToWorld(mScreenPos)

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

        drawInHands(gc, this.cam, this.inHands, mPos)

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
        if (this.inputs.isKeyDown('ArrowUp') || this.inputs.isKeyDown('KeyW')) {
            dir.y -= 1
        } else if (this.inputs.isKeyDown('ArrowDown') || this.inputs.isKeyDown('KeyS')) {
            dir.y += 1
        }
        if (this.inputs.isKeyDown('ArrowLeft') || this.inputs.isKeyDown('KeyA')) {
            dir.x -= 1
        } else if (this.inputs.isKeyDown('ArrowRight') || this.inputs.isKeyDown('KeyD')) {
            dir.x += 1
        }
        const sprinting = this.inputs.isKeyDown('ShiftLeft')

        if (!eq(dir, this.user.dir) || this.user.sprinting != sprinting) {
            this.conn.send({ type: 'move', dir: toDouble(dir), sprinting })
        }
        this.user.dir = !isZero(dir) ? normalized(dir) : dir
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

    private step(dt: number) {
        const speed = mag(this.user.vel)
        if (speed === 0) {
            this.timeSinceStep = 0
            return
        }

        this.timeSinceStep += dt
        if (this.timeSinceStep * speed > Consts.STEP_DIST) {
            this.sound.step()
            this.timeSinceStep = 0
        }
    }

    private updateInHands() {
        if (this.inHands.buildingType) {
            const mScreenPos = this.inputs.getMouseScreenPos()
            const mPos = this.cam.vecScreenToWorld(mScreenPos)
            const ix = Math.floor(mPos.x)
            const iy = Math.floor(mPos.y)
            this.inHands.valid = this.canPlaceBuilding(ix, iy)
        }
    }

    private canPlaceBuilding(ix: number, iy: number) {
        if (!this.map.isInside(ix, iy) || this.map.tiles[iy][ix].building || !this.map.tiles[iy][ix].walkable) {
            return false
        }
        const placePos = Vec(ix + 0.5, iy + 0.5)
        const dist = mag(sub(placePos, this.user.pos))
        return dist < Consts.BUILD_PLACE_MAX_DIST
    }
}
