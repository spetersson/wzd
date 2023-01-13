import * as bson from 'bson'

import { Building } from '@/map'
import { Vec } from '@/utils/math'
import { Enemy } from '@/game'

import { PacketBase } from '.'

export interface Player {
    username: string
    pos: Vec
    vel: Vec
    dir: Vec
    sprinting: boolean
}

export interface GetPacketUpdate extends PacketBase<'update'> {
    timestamp: number
    players: Player[]
    buildings: Building[]
    enemies: Enemy[]
}
export interface GetPacketMessage extends PacketBase<'message'> {
    username?: string
    message: string
}
export interface GetPacketPing extends PacketBase<'pong'> {
    timestamp: number
}
export interface GetPacketMap extends PacketBase<'map'> {
    width: number
    height: number
    bytes: bson.Binary
}

export type GetPacket = GetPacketUpdate | GetPacketMessage | GetPacketPing | GetPacketMap
