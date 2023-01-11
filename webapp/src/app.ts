import { Chat } from '@/components/chat'
import { Login } from '@/components/login'
import Game from '@/game'
import { Connection, GetPacket } from '@/server'
import { Inputs } from '@/utils'

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
        let username = '-'
        while (!this.conn.connected) {
            try {
                const loginRes = await this.login.login()
                username = loginRes.username
                await this.conn.connect(loginRes.host)
            } catch (err) {
                console.error(err)
                let msg = 'Failed to connect to server'
                if (err instanceof Error) {
                    msg = err.message
                }
                this.login.errorMsg(msg)
            }
        }
        this.login.hide()

        this.game.show()
        this.game.init(username)
        this.chat.init(username)

        this.game.join()
        this.game.focus()

        this.inGame = true

        this.inputs.onKeyUp('Enter', this.onEnterKey.bind(this))
        this.inputs.onKeyUp('Escape', this.onEscKey.bind(this))

        requestAnimationFrame(this.loop.bind(this))
    }

    async loop() {
        this.game.frame()
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
