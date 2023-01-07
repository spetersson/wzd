import * as bson from 'bson'

import { Building } from '@/utils/map'
import { Vec } from '@/utils/math'

export interface Player {
    username: string
    pos: Vec
    vel: Vec
    dir: Vec
    sprinting: boolean
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
export interface GetPacketMap {
    type: 'map'
    width: number
    height: number
    bytes: bson.Binary
}

export type GetPacket = GetPacketUpdate | GetPacketMessage | GetPacketPing | GetPacketMap
