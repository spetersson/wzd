import { Vec } from '../utils/math'

export interface Player {
    username: string
    pos: Vec
    vel: Vec
}

export interface GetPacketUpdate {
    type: 'update'
    timestamp: number
    players: Player[]
}
export interface GetPacketMessage {
    type: 'message'
    username: string
    message: string
}
export interface GetPacketPing {
    type: 'ping'
    timestamp: number
}

export type GetPacket = GetPacketUpdate | GetPacketMessage | GetPacketPing
