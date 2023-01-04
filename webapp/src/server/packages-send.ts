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
export interface SendPackageChat {
    type: 'chat'
    message: string
}

export type SendPackage = SendPackageJoin | SendPackageMove | SendPackageChat
