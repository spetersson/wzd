import { Building } from '../utils/map'
import { Vec } from '../utils/math'

export interface Player {
    username: string
    pos: Vec
    vel: Vec
    dir: Vec
}

export interface GetPacketUpdate {
    type: 'update'
    timestamp: number
    players: Player[]
    buildings: Building[]
}
export interface GetPacketMessage {
    type: 'message'
    username: string
    message: string
}
export interface GetPacketPing {
    type: 'pong'
    timestamp: number
}

export type GetPacket = GetPacketUpdate | GetPacketMessage | GetPacketPing
