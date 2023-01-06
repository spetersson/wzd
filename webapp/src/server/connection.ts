import { GetPacket } from './packet-get'
import { SendPacket } from './packet-send'
import * as bson from 'bson'

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
            this.conn.binaryType = 'arraybuffer'
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
        this.conn.send(bson.serialize(data))
    }

    private async onmessage(ev: MessageEvent) {
        if (!(ev.data instanceof ArrayBuffer)) {
            console.error(`Message data is not a ArrayByffer:`, ev.data)
            return
        }

        let i = 0
        while (i < ev.data.byteLength) {
            try {
                const len = new Int32Array(ev.data.slice(i, i + 4))[0]
                if (i + len > ev.data.byteLength) {
                    throw new Error(`Invalid BSON object`)
                }

                const packet = bson.deserialize(ev.data, {
                    allowObjectSmallerThanBufferSize: true,
                    index: i,
                }) as GetPacket
                if (typeof packet !== 'object') {
                    throw new Error('Packet was not a object')
                }
                if (!('type' in packet)) {
                    throw new Error('Packet did not have a type field')
                }
                this.receive(packet)

                i += len
            } catch (err) {
                console.error(err)
                console.error(`Failed to parse packet: '${ev.data}'`)
                return
            }
        }
    }
    private async onerror(ev: Event) {
        console.error(ev)
    }
}
