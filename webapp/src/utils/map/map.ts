import worldMapUrl from '@/assets/world.map.png'
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
    buildingTypes: Record<number, BuildingType>
    tileSprites: Record<number, Sprite>
}

const buildingTypes: Record<number, BuildingType> = {
    1: { name: 'Wall', typeId: 1, size: 0.8 },
    2: { name: 'Turret', typeId: 2, size: 0.8 },
}

export function isWholeTile(tile: Tile): tile is WholeTile {
    return Boolean((tile as WholeTile).tileSprite)
}
export function isSubTile(tile: Tile): tile is SubTile {
    return Boolean((tile as SubTile).subtileSprites)
}

export async function getWorldMap() {
    const tileSprites = await getAllSprites()

    return new Promise<MapData>((resolve) => {
        const img = new Image()
        img.onload = (ev) => {
            const canvas = document.createElement('canvas')
            const width = (canvas.width = img.width)
            const height = (canvas.height = img.height)
            const gc = canvas.getContext('2d')
            gc.drawImage(img, 0, 0)
            const imgData = gc.getImageData(0, 0, canvas.width, canvas.height)

            // First create boolean 2d array of the map (land=true, water=false)
            const landMap: boolean[][] = new Array<boolean[]>(height)
            for (let y = 0; y < height; y++) {
                const row: boolean[] = new Array<boolean>(width)
                for (let x = 0; x < width; x++) {
                    row[x] = imgData.data[y * width * 4 + x * 4] > 128
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
                        let tile1 = SpriteType.SUBTILE_WATER
                        let tile2 = SpriteType.SUBTILE_WATER
                        let tile3 = SpriteType.SUBTILE_WATER
                        let tile4 = SpriteType.SUBTILE_WATER

                        // TILE 1:
                        if (y - 1 > 0 && x - 1 > 0 && landMap[y - 1][x] && landMap[y][x - 1]) {
                            tile1 = SpriteType.SUBTILE_CORNER_FRONT_L
                        } else if (y - 1 > 0 && landMap[y - 1][x]) {
                            tile1 = SpriteType.SUBTILE_FRONT
                        } else if (x - 1 > 0 && landMap[y][x - 1]) {
                            tile1 = SpriteType.SUBTILE_SIDE_L
                        } else if (y - 1 > 0 && x - 1 > 0 && landMap[y - 1][x - 1]) {
                            tile1 = SpriteType.SUBTILE_POINT_FRONT_L
                        }

                        // TILE 2:
                        if (y - 1 > 0 && landMap[y - 1][x] && landMap[y][x + 1]) {
                            tile2 = SpriteType.SUBTILE_CORNER_FRONT_R
                        } else if (y - 1 > 0 && landMap[y - 1][x]) {
                            tile2 = SpriteType.SUBTILE_FRONT
                        } else if (x - 1 > 0 && landMap[y][x + 1]) {
                            tile2 = SpriteType.SUBTILE_SIDE_R
                        } else if (y - 1 > 0 && landMap[y - 1][x + 1]) {
                            tile2 = SpriteType.SUBTILE_POINT_FRONT_R
                        }

                        // TILE 3:
                        if (y + 1 < height && x - 1 > 0 && landMap[y + 1][x] && landMap[y][x - 1]) {
                            tile3 = SpriteType.SUBTILE_CORNER_BACK_L
                        } else if (y + 1 < height && landMap[y + 1][x]) {
                            tile3 = SpriteType.SUBTILE_BACK
                        } else if (x - 1 > 0 && landMap[y][x - 1]) {
                            tile3 = SpriteType.SUBTILE_SIDE_L
                        } else if (y + 1 < height && x > 0 && landMap[y + 1][x - 1]) {
                            tile3 = SpriteType.SUBTILE_POINT_BACK_L
                        }

                        // TILE 4:
                        if (y + 1 < height && x + 1 < width && landMap[y + 1][x] && landMap[y][x + 1]) {
                            tile4 = SpriteType.SUBTILE_CORNER_BACK_R
                        } else if (y + 1 < height && landMap[y + 1][x]) {
                            tile4 = SpriteType.SUBTILE_BACK
                        } else if (x + 1 < width && landMap[y][x + 1]) {
                            tile4 = SpriteType.SUBTILE_SIDE_R
                        } else if (y + 1 < height && x + 1 < width && landMap[y + 1][x + 1]) {
                            tile4 = SpriteType.SUBTILE_POINT_BACK_R
                        }

                        row[x] = {
                            walkable: false,
                            building: null,
                            subtileSprites: [
                                tileSprites[tile1],
                                tileSprites[tile2],
                                tileSprites[tile3],
                                tileSprites[tile4],
                            ],
                        }
                    }
                }
                tiles[y] = row
            }

            resolve({
                width,
                height,
                tiles,
                buildings: {},
                buildingTypes,
                tileSprites,
            })
        }
        img.src = worldMapUrl
    })
}
