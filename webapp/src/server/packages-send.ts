export interface SendPackageJoin {
    type: 'join'
    nick: string
}
export interface SendPackageMove {
    type: 'move'
    x: number
    y: number
}

export type SendPackage = SendPackageJoin | SendPackageMove
