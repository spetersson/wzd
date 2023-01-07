import * as bson from 'bson'

import { Vec } from '@/utils/math'

export interface VecDouble {
    x: bson.Double
    y: bson.Double
}

export interface VecInt32 {
    x: bson.Int32
    y: bson.Int32
}
export function toDouble(v: number): bson.Double
export function toDouble(v: Vec): VecDouble
export function toDouble(v: number | Vec): bson.Double | VecDouble {
    return typeof v === 'object'
        ? {
              x: new bson.Double(v.x),
              y: new bson.Double(v.y),
          }
        : new bson.Double(v)
}

export function toInt32(v: number): bson.Int32
export function toInt32(v: Vec): VecInt32
export function toInt32(v: number | Vec): bson.Int32 | VecInt32 {
    return typeof v === 'object'
        ? {
              x: new bson.Int32(v.x),
              y: new bson.Int32(v.y),
          }
        : new bson.Int32(v)
}
