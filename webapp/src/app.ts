import Build from '@/components/build'
import { Chat } from '@/components/chat'
import Game from '@/components/game'
import { Login } from '@/components/login'
import Connection from '@/server/connection'
import { GetPacket } from '@/server/packet-get'
import Inputs from '@/utils/inputs'

export class WZDApp {
    inputs: Inputs
    conn: Connection
    login: Login
    game: Game
    chat: Chat
    build: Build

    inGame: boolean

    async init() {
        if (this.conn) {
            throw new Error(`App is already initialized`)
        }

        this.login = new Login()

        this.inputs = new Inputs()
        this.conn = new Connection(this.receive.bind(this))
        this.game = new Game(this.conn, this.inputs)
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

        this.inputs.listenUp('KeyE', this.onEKey.bind(this))

        requestAnimationFrame(this.loop.bind(this))
    }

    async loop() {
        this.game.update()
        this.game.draw()
        requestAnimationFrame(this.loop.bind(this))
    }

    private async receive(pkt: GetPacket) {
        const components = [this.game, this.chat, this.login]
        for (const comp of components) {
            if (comp.accepts().includes(pkt.type)) {
                await comp.receive(pkt)
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
    private onEKey() {
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
