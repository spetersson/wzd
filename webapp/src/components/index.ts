import { GetPacket } from '@/server'

export abstract class Receiver {
    constructor(private acceptPktTypes: GetPacket['type'][] = []) {}

    accepts() {
        return this.acceptPktTypes
    }

    abstract receive(pkg: GetPacket): void | Promise<void>
}
