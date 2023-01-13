import { BuildingType } from '@/map'
import { Vec } from '@/utils/math'

const BUILDING_TYPES: Record<number, BuildingType> = {
    1: { name: 'Wall', typeId: 1, size: 0.8 },
    2: { name: 'Turret', typeId: 2, size: 0.8 },
    3: { name: 'EnemyBase', typeId: 2, size: 0.8 },
}

export const Consts = {
    VIEW_W: 50,
    MAX_REG_SPEED: 10,
    MAX_SPRINT_SPEED: 15,
    ACC: 40,
    SLOWDOWN: 2,
    PLAYER_RAD: 0.45,
    PING_INTERVAL: 500,
    NUM_PINGS_AVG: 10,
    PREFERED_VIEW_SIZE: Vec(50, 28),
    BUILD_PLACE_MAX_DIST: 5,
    STEP_DIST: 2,
    BUILDING_TYPES,
} as const
