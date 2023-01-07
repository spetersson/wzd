import * as bson from 'bson'

import { GetPacket } from '@/server/packet-get'
import { SendPacket } from '@/server/packet-send'

interface ConnectionStats {
    sumReceive: number
    sumReceiveHist: number[]
    receivePerSecond: number
    sumSend: number
    sumSendHist: number[]
    sendPerSecond: number
}

export default class Connection {
    private conn: WebSocket
    private stats: ConnectionStats

    constructor(private receive: (data: GetPacket) => void) {
        this.stats = {
            sumReceive: 0,
            sumReceiveHist: [],
            receivePerSecond: 0,
            sumSend: 0,
            sumSendHist: [],
            sendPerSecond: 0,
        }
        setInterval(() => this.statsTick(), 1000)
    }

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

    send(pkt: SendPacket) {
        if (!this.conn) {
            throw new Error(`Can't send, not connected`)
        }
        const data = bson.serialize(pkt)
        this.stats.sumSend += data.byteLength
        this.conn.send(data)
    }

    getStats() {
        return {
            receivePerSecond: this.stats.receivePerSecond,
            sendPerSecond: this.stats.sendPerSecond,
        }
    }

    private async onmessage(ev: MessageEvent) {
        if (!(ev.data instanceof ArrayBuffer)) {
            console.error(`Message data is not a ArrayByffer:`, ev.data)
            return
        }

        this.stats.sumReceive += ev.data.byteLength

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

    private statsTick() {
        // Add current sum to history
        this.stats.sumReceiveHist.unshift(this.stats.sumReceive)
        this.stats.sumReceiveHist.splice(5)
        this.stats.sumReceive = 0
        // Calculate avg data receive rate per second
        this.stats.receivePerSecond =
            this.stats.sumReceiveHist.reduce((p, c) => p + c) / this.stats.sumReceiveHist.length

        // Same for send
        this.stats.sumSendHist.unshift(this.stats.sumSend)
        this.stats.sumSendHist.splice(5)
        this.stats.sumSend = 0
        this.stats.sendPerSecond = this.stats.sumSendHist.reduce((p, c) => p + c) / this.stats.sumSendHist.length
    }
}
