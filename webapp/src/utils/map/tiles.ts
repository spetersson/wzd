import cliffBackUrl from '@/assets/subtiles/cliff/cliff_back.png'
import cliffCornerBackUrl from '@/assets/subtiles/cliff/cliff_corner_back.png'
import cliffCornerFrontUrl from '@/assets/subtiles/cliff/cliff_corner_front.png'
import cliffFrontUrl from '@/assets/subtiles/cliff/cliff_front.png'
import cliffPointBackUrl from '@/assets/subtiles/cliff/cliff_point_back.png'
import cliffPointFrontUrl from '@/assets/subtiles/cliff/cliff_point_front.png'
import cliffSideBackUrl from '@/assets/subtiles/cliff/cliff_side_back.png'
import cliffSideUrl from '@/assets/subtiles/cliff/cliff_side.png'
import cliffWaterUrl from '@/assets/subtiles/cliff/cliff_water.png'
import tileLandUrl from '@/assets/tiles/tile_land.png'
import tileWaterUrl from '@/assets/tiles/tile_water.png'

export enum SpriteType {
    SUBTILE_BACK = 1,
    SUBTILE_CORNER_BACK_L = 2,
    SUBTILE_CORNER_BACK_R = 3,
    SUBTILE_CORNER_FRONT_L = 4,
    SUBTILE_CORNER_FRONT_R = 5,
    SUBTILE_FRONT = 6,
    SUBTILE_POINT_BACK_L = 7,
    SUBTILE_POINT_BACK_R = 8,
    SUBTILE_POINT_FRONT_L = 9,
    SUBTILE_POINT_FRONT_R = 10,
    SUBTILE_SIDE_BACK_L = 11,
    SUBTILE_SIDE_BACK_R = 12,
    SUBTILE_SIDE_L = 13,
    SUBTILE_SIDE_R = 14,
    SUBTILE_WATER = 15,
    TILE_LAND = 16,
    TILE_WATER = 17,
}

export interface Sprite {
    img: HTMLImageElement
}

function loadTile(url: string, flipX?: boolean) {
    return new Promise<Sprite>((resolve) => {
        const img = new Image()
        img.onload = () => {
            if (!flipX) {
                resolve({ img })
                return
            }

            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const gc = canvas.getContext('2d')
            gc.translate(img.width, 0)
            gc.scale(-1, 1)
            gc.drawImage(img, 0, 0)

            const flipImg = new Image()
            flipImg.onload = () => {
                resolve({ img: flipImg })
            }
            flipImg.src = canvas.toDataURL()
        }
        img.src = url
    })
}

export async function getAllSprites(): Promise<Record<SpriteType, Sprite>> {
    const spriteLoads = {
        [SpriteType.SUBTILE_BACK]: loadTile(cliffBackUrl),
        [SpriteType.SUBTILE_CORNER_BACK_L]: loadTile(cliffCornerBackUrl, true),
        [SpriteType.SUBTILE_CORNER_BACK_R]: loadTile(cliffCornerBackUrl),
        [SpriteType.SUBTILE_CORNER_FRONT_L]: loadTile(cliffCornerFrontUrl, true),
        [SpriteType.SUBTILE_CORNER_FRONT_R]: loadTile(cliffCornerFrontUrl),
        [SpriteType.SUBTILE_FRONT]: loadTile(cliffFrontUrl),
        [SpriteType.SUBTILE_POINT_BACK_L]: loadTile(cliffPointBackUrl, true),
        [SpriteType.SUBTILE_POINT_BACK_R]: loadTile(cliffPointBackUrl),
        [SpriteType.SUBTILE_POINT_FRONT_L]: loadTile(cliffPointFrontUrl, true),
        [SpriteType.SUBTILE_POINT_FRONT_R]: loadTile(cliffPointFrontUrl),
        [SpriteType.SUBTILE_SIDE_BACK_L]: loadTile(cliffSideBackUrl, true),
        [SpriteType.SUBTILE_SIDE_BACK_R]: loadTile(cliffSideBackUrl),
        [SpriteType.SUBTILE_SIDE_L]: loadTile(cliffSideUrl, true),
        [SpriteType.SUBTILE_SIDE_R]: loadTile(cliffSideUrl),
        [SpriteType.SUBTILE_WATER]: loadTile(cliffWaterUrl),
        [SpriteType.TILE_LAND]: loadTile(tileLandUrl),
        [SpriteType.TILE_WATER]: loadTile(tileWaterUrl),
    }

    const res: Record<SpriteType, Sprite> = {} as Record<SpriteType, Sprite>
    for (const type in spriteLoads) {
        const spriteType = type as any as SpriteType
        res[spriteType] = await spriteLoads[spriteType]
    }
    return res
}
