import { GetPackage } from './packages-get'
import { SendPackage } from './packages-send'

export default class Connection {
    private conn: WebSocket

    constructor(private receive: (data: GetPackage) => void) {}

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

    send(data: SendPackage) {
        if (!this.conn) {
            throw new Error(`Can't send, not connected`)
        }

        this.conn.send(JSON.stringify(data))
    }

    private async onmessage(ev: MessageEvent) {
        try {
            const data = JSON.parse(String(ev.data))
            if (typeof data !== 'object') {
                throw new Error('Package was not a object')
            }
            if (!('type' in data)) {
                throw new Error('Package did not have a type field')
            }
            this.receive(data)
        } catch (err) {
            console.error(err)
            console.error(`Failed to parse message: '${String(ev.data)}'`)
        }
    }
    private async onerror(ev: Event) {
        console.error(ev)
    }
}
