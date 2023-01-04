export interface SendPackageJoin {
    type: 'join'
    username: string
    x: number
    y: number
}
export interface SendPackageMove {
    type: 'move'
    x: number
    y: number
}

export type SendPackage = SendPackageJoin | SendPackageMove
