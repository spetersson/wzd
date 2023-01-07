import { Vec } from '@/utils/math'

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
} as const
