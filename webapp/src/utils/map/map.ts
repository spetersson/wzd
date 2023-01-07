import { getAllSprites, Sprite, SpriteType } from '@/utils/map/tiles'

export interface BuildingType {
    name: string
    typeId: number
    size: number
}

export interface Building {
    id: number
    typeId: number
    ix: number
    iy: number
}

export interface TileBase {
    walkable: boolean
    building: Building | null
}
export interface WholeTile extends TileBase {
    tileSprite: Sprite
}
export interface SubTile extends TileBase {
    subtileSprites: [Sprite, Sprite, Sprite, Sprite]
}
export type Tile = WholeTile | SubTile

export interface MapData {
    width: number
    height: number
    tiles: Tile[][]
    buildings: Record<number, Building>
    tileSprites: Record<number, Sprite>
}

export function isWholeTile(tile: Tile): tile is WholeTile {
    return Boolean((tile as WholeTile).tileSprite)
}
export function isSubTile(tile: Tile): tile is SubTile {
    return Boolean((tile as SubTile).subtileSprites)
}

export async function getWorldMap(data: Uint8Array, width: number, height: number) {
    const tileSprites = await getAllSprites()

    // First create boolean 2d array of the map (land=true, water=false)
    const landMap: boolean[][] = new Array<boolean[]>(height)
    for (let y = 0; y < height; y++) {
        const row: boolean[] = new Array<boolean>(width)
        for (let x = 0; x < width; x++) {
            const tileId = data[y * width + x]
            row[x] = tileId === 1
        }
        landMap[y] = row
    }

    const tiles = new Array<Tile[]>(height)
    for (let y = 0; y < height; y++) {
        const row = new Array<Tile>(width)
        for (let x = 0; x < width; x++) {
            if (landMap[y][x]) {
                row[x] = { walkable: true, building: null, tileSprite: tileSprites[SpriteType.TILE_LAND] }
            } else {
                // TODO: Implement subtiling
                /* Example of a tile with subtiling
                        {
                            walkable: false,
                            building: null,
                            subtileSprites: [
                                tileSprites[SpriteType.SUBTILE_CORNER_FRONT_L],
                                tileSprites[SpriteType.SUBTILE_CORNER_FRONT_R],
                                tileSprites[SpriteType.SUBTILE_CORNER_BACK_L],
                                tileSprites[SpriteType.SUBTILE_CORNER_BACK_R],
                            ],
                        }
                        */
                row[x] = { walkable: false, building: null, tileSprite: tileSprites[SpriteType.TILE_WATER] }
            }
        }
        tiles[y] = row
    }

    return {
        width,
        height,
        tiles,
        buildings: {},
        tileSprites,
    }
}
