import { Vec } from '../utils/math'

export interface SendPacketJoin {
    type: 'join'
    username: string
    x: number
    y: number
}
export interface SendPacketMove {
    type: 'move'
    x: number
    y: number
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
