import { Chat } from '@/components/chat'
import Game from '@/game'
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

        this.game.hide()
        this.chat.hide()

        this.login.show()
        const loginRes = await this.login.login()
        this.login.hide()

        await this.conn.connect(loginRes.host)

        this.game.show()
        this.game.init()
        this.chat.init(loginRes.username)

        this.game.join(loginRes.username)
        this.game.focus()

        this.inGame = true

        this.inputs.listenUp('Enter', this.onEnterKey.bind(this))
        this.inputs.listenUp('Escape', this.onEscKey.bind(this))

        requestAnimationFrame(this.loop.bind(this))
    }

    async loop() {
        this.game.update()
        this.game.draw()
        requestAnimationFrame(this.loop.bind(this))
    }

    private async receive(pkt: GetPacket) {
        const components = [this.game, this.chat]
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
            this.game.focus()
            this.inGame = true
        }
    }
}
