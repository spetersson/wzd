import { GetPacket } from './packet-get'
import { SendPacket } from './packet-send'

export default class Connection {
    private conn: WebSocket

    constructor(private receive: (data: GetPacket) => void) {}

    async connect(path: string) {
        return new Promise<void>((resolve, reject) => {
            if (this.conn) {
                reject(new Error('Already connected'))
                return
            }

            this.conn = new WebSocket(`ws://${path}/ws`)
            this.conn.onerror = () => {
                this.conn = null
                reject(new Error('Failed to connect'))
            }
            this.conn.onopen = () => {
                this.conn.onmessage = (ev) => {
                    this.onmessage(ev)
                }
                this.conn.onerror = (ev) => {
                    this.onerror(ev)
                }
                resolve()
            }
        })
    }

    send(data: SendPacket) {
        if (!this.conn) {
            throw new Error(`Can't send, not connected`)
        }
        this.conn.send(JSON.stringify(data))
    }

    private async onmessage(ev: MessageEvent) {
        // Split message into packets if needed
        let packetsRaw: string[]
        try {
            if (typeof ev.data !== 'string') {
                throw new Error(
                    `Expected data to be a string, got ${typeof ev.data}`
                )
            }
            packetsRaw = ev.data
                .split('\n')
                .map((p) => p.trim())
                .filter((p) => Boolean(p))
        } catch (err) {
            console.error(err)
            console.error(`Failed to parse message: '${String(ev.data)}'`)
            return
        }

        // Handle each packet
        for (const packetRaw of packetsRaw) {
            try {
                const packet = JSON.parse(packetRaw)
                if (typeof packet !== 'object') {
                    throw new Error('Packet was not a object')
                }
                if (!('type' in packet)) {
                    throw new Error('Packet did not have a type field')
                }
                this.receive(packet)
            } catch (err) {
                console.error(err)
                console.error(`Failed to parse packet: '${packetRaw}'`)
                return
            }
        }
    }
    private async onerror(ev: Event) {
        console.error(ev)
    }
}
