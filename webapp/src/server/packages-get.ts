export interface Player {
    username: string
    x: number
    y: number
}

export interface GetPackageUpdate {
    type: 'update'
    players: Player[]
}
export interface GetPackageMessage {
    type: 'message'
    username: string
    message: string
}

export type GetPackage = GetPackageUpdate | GetPackageMessage
