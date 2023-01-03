export interface Player {
    nick: string
    x: number
    y: number
}

export interface GetPackageUpdate {
    type: 'update'
    players: Player[]
}
export interface GetPackageMessage {
    type: 'message'
    nick: string
    message: string
}

export type GetPackage = GetPackageUpdate | GetPackageMessage
