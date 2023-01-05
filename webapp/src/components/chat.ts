import { Component } from '.'
import Connection from '../server/connection'
import { GetPacket } from '../server/packet-get'

const PERSISTENCE_TIME = 10 * 1000 // 10 sec

export class Chat extends Component {
    containerElem: HTMLDivElement
    messagesElem: HTMLDivElement
    textboxElem: HTMLDivElement
    chatPlayerUsername: HTMLSpanElement
    chatInput: HTMLInputElement

    username: string
    messages: {
        elem: HTMLDivElement
        timestamp: number
    }[] = []

    constructor(private conn: Connection) {
        super([])
        this.containerElem = document.getElementById(
            'chat-container'
        ) as HTMLDivElement
        this.messagesElem = document.getElementById(
            'chat-messages'
        ) as HTMLDivElement
        this.textboxElem = document.getElementById(
            'chat-textbox'
        ) as HTMLDivElement
        this.chatPlayerUsername = document.getElementById(
            'chat-player-username'
        ) as HTMLSpanElement
        this.chatInput = document.getElementById(
            'chat-input'
        ) as HTMLInputElement

        this.chatPlayerUsername.textContent = '-'

        setInterval(() => {
            this.refresh()
        }, 1000)
        this.hide()
    }

    init(username: string) {
        this.username = username
        this.chatPlayerUsername.textContent = username
    }

    _unfocus() {
        this.chatInput.blur()
    }
    _focus() {
        this.chatInput.focus()
    }
    _show() {
        this.containerElem.style.backgroundColor = 'rgba(255,255,255,0.3)'
        this.textboxElem.style.opacity = '1'
        for (const message of this.messages) {
            message.elem.style.opacity = '1'
        }
    }
    _hide() {
        this.containerElem.style.backgroundColor = 'transparent'
        this.textboxElem.style.opacity = '0'
        for (const message of this.messages) {
            if (message.timestamp < Date.now() - PERSISTENCE_TIME) {
                message.elem.style.opacity = '0'
            } else {
                message.elem.style.opacity = '1'
            }
        }
    }

    addMessage(from: string, text: string) {
        const div = document.createElement('div')
        const spanUsername = document.createElement('span')
        spanUsername.textContent = from
        spanUsername.className = 'chat-username'
        const spanContent = document.createElement('span')
        spanContent.textContent = text
        spanContent.className = 'chat-content'
        div.append(spanUsername, spanContent)
        this.messagesElem.appendChild(div)

        this.messages.push({
            elem: div,
            timestamp: Date.now(),
        })
    }
    receive(pkt: GetPacket) {
        switch (pkt.type) {
            case 'message':
                this.addMessage(pkt.username, pkt.message)
                break

            default:
                console.error(`Unknown packet type: ${pkt.type}`)
                return
        }
    }

    sendMsg() {
        if (this.status === 'hide' || this.chatInput.value.length === 0) {
            return
        }
        this.conn.send({ type: 'chat', message: this.chatInput.value })
        this.chatInput.value = ''
    }

    private refresh() {
        if (this.status === 'show') {
            return
        }
        for (const message of this.messages) {
            if (message.timestamp < Date.now() - PERSISTENCE_TIME) {
                message.elem.style.opacity = '0'
            }
        }
    }
}
