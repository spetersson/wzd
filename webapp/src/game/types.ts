import { BuildingType } from '@/utils/map'
import { Vec } from '@/utils/math'

export interface Enemy {
    id: number
    pos: Vec
}

export interface InHands {
    buildingType?: BuildingType
    valid?: boolean
}
