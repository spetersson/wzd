import Build from './components/build'
import { Chat } from './components/chat'
import Connection from './server/connection'
import Game from './components/game'
import { Login } from './components/login'
import { getWorldMap } from './utils/map'
import Inputs from './utils/inputs'
import { GetPacket } from './server/packet-get'

export class WZDApp {
    inputs: Inputs
    conn: Connection
    login: Login
    game: Game
    chat: Chat
    build: Build

    inGame: boolean
    lastTime: number

    async init() {
        if (this.conn) {
            throw new Error(`App is already initialized`)
        }

        this.login = new Login()

        this.inputs = new Inputs()
        this.conn = new Connection(this.receive.bind(this))
        const worldMap = await getWorldMap()
        this.game = new Game(worldMap, this.conn, this.inputs)
        this.chat = new Chat(this.conn)
        this.build = new Build(this.conn, this.game)

        this.login.show()
        this.game.hide()
        this.chat.hide()
        this.build.hide()

        const loginRes = await this.login.login()
        this.chat.init(loginRes.username)
        await this.conn.connect(loginRes.host)
        this.game.join(loginRes.username)

        this.login.hide()
        this.game.show()
        this.game.focus()

        this.inGame = true

        this.inputs.listenUp('Enter', this.onEnterKey.bind(this))
        this.inputs.listenUp('Escape', this.onEscKey.bind(this))

        this.inputs.listenUp('KeyB', this.onBKey.bind(this))

        this.lastTime = Date.now()
        requestAnimationFrame(this.loop.bind(this))
    }

    async loop() {
        const now = Date.now()
        this.game.update((now - this.lastTime) / 1000)
        this.game.draw()

        this.lastTime = now
        requestAnimationFrame(this.loop.bind(this))
    }

    private receive(pkt: GetPacket) {
        const components = [this.game, this.chat, this.login]
        for (const comp of components) {
            if (comp.accepts().includes(pkt.type)) {
                comp.receive(pkt)
            }
        }
    }
    private onEnterKey() {
        if (this.inGame) {
            this.chat.show()
            this.chat.focus()
            this.game.unfocus()
            this.inGame = false
        } else if (this.chat.status === 'show') {
            this.chat.sendMsg()
            this.chat.hide()
            this.game.focus()
            this.inGame = true
        }
    }
    private onEscKey() {
        if (!this.inGame) {
            this.chat.hide()
            this.build.hide()
            this.game.focus()
            this.inGame = true
        }
    }
    private onBKey() {
        if (this.inGame) {
            this.build.show()
            this.inGame = false
            this.game.unfocus()
        } else if (this.build.status === 'show') {
            this.build.hide()
            this.inGame = true
            this.game.focus()
        }
    }
}
