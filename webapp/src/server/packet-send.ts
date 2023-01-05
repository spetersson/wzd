import { Vec } from '../utils/math'

export interface SendPacketJoin {
    type: 'join'
    username: string
    pos: Vec
}
export interface SendPacketMove {
    type: 'move'
    dir: Vec
    sprinting: boolean
}
export interface SendPacketChat {
    type: 'chat'
    message: string
}
export interface SendPacketPing {
    type: 'ping'
    timestamp: number
}
export interface SendPacketBuild {
    type: 'build'
    item: string
    ix: number
    iy: number
}

export type SendPacket =
    | SendPacketJoin
    | SendPacketMove
    | SendPacketChat
    | SendPacketPing
    | SendPacketBuild
