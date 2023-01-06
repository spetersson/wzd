import { VecDouble, VecInt32 } from './types'
import * as bson from 'bson'

export interface SendPacketJoin {
    type: 'join'
    username: string
    pos: VecDouble
}
export interface SendPacketMove {
    type: 'move'
    dir: VecDouble
    sprinting: boolean
}
export interface SendPacketChat {
    type: 'chat'
    message: string
}
export interface SendPacketPing {
    type: 'pong'
    timestamp: number
}
export interface SendPacketBuild {
    type: 'build'
    typeId: bson.Int32
    idx: VecInt32
}

export type SendPacket =
    | SendPacketJoin
    | SendPacketMove
    | SendPacketChat
    | SendPacketPing
    | SendPacketBuild
