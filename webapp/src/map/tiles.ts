import cliffsTileMapUrl from '@/assets/tile_maps/cliffs_tile_map.png'

const TILE_MAP_COORDS = {
    SUBTILE_BACK: [128, 0, 64, 64],
    SUBTILE_BACK_POINT_EASE_L: [64, 0, 64, 64],
    SUBTILE_BACK_POINT_EASE_R: [64, 0, 64, 64],
    SUBTILE_BACK_POINT_L: [0, 0, 64, 64],
    SUBTILE_BACK_POINT_R: [0, 0, 64, 64],
    SUBTILE_CORNER_BACK_L: [128, 128, 64, 64],
    SUBTILE_CORNER_BACK_R: [128, 128, 64, 64],
    SUBTILE_CORNER_FRONT_L: [128, 64, 64, 64],
    SUBTILE_CORNER_FRONT_R: [128, 64, 64, 64],
    SUBTILE_FRONT: [128, 192, 64, 64],
    SUBTILE_FRONT_POINT_EASE_L: [64, 192, 64, 64],
    SUBTILE_FRONT_POINT_EASE_R: [64, 192, 64, 64],
    SUBTILE_POINT_BACK_L: [0, 0, 64, 64],
    SUBTILE_POINT_BACK_R: [0, 0, 64, 64],
    SUBTILE_POINT_FRONT_L: [0, 192, 64, 64],
    SUBTILE_POINT_FRONT_R: [0, 192, 64, 64],
    SUBTILE_SIDE_BACK_POINT_EASE_L: [0, 64, 64, 64],
    SUBTILE_SIDE_BACK_POINT_EASE_R: [0, 64, 64, 64],
    SUBTILE_SIDE_FRONT_POINT_EASE_L: [0, 128, 64, 64],
    SUBTILE_SIDE_FRONT_POINT_EASE_R: [0, 128, 64, 64],
    SUBTILE_SIDE_L: [64, 128, 64, 64],
    SUBTILE_SIDE_R: [64, 128, 64, 64],
    SUBTILE_WATER: [64, 64, 64, 64],
    TILE_LAND: [192, 128, 128, 128],
    TILE_WATER: [192, 0, 128, 128],
} as const

export type SpriteType = keyof typeof TILE_MAP_COORDS

export interface Sprite {
    img: HTMLImageElement
}

function loadImg(url: string) {
    return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image()
        img.onload = () => {
            resolve(img)
        }
        img.src = url
    })
}

async function createSprite(
    tileMapImg: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    flipX?: boolean
): Promise<Sprite> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const gc = canvas.getContext('2d')
        if (flipX) {
            gc.scale(-1, 1)
            gc.translate(-w, 0)
        }
        gc.drawImage(tileMapImg, x, y, w, h, 0, 0, w, h)
        const img = new Image()
        img.onload = () => {
            resolve({ img })
        }
        img.src = canvas.toDataURL()
    })
}

export async function getAllSprites(): Promise<Record<SpriteType, Sprite>> {
    const img = await loadImg(cliffsTileMapUrl)
    const sprites: Partial<Record<SpriteType, Sprite>> = {}
    for (const key in TILE_MAP_COORDS) {
        const tileType = key as SpriteType
        const c = TILE_MAP_COORDS[tileType]
        const flipX = key.endsWith('_L')
        sprites[tileType] = await createSprite(img, c[0], c[1], c[2], c[3], flipX)
    }
    return sprites as Record<SpriteType, Sprite>
}
