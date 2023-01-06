import worldMapUrl from '../assets/world.map.png'

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

export interface Tile {
    walkable: boolean
    building: Building | null
}

export interface MapData {
    width: number
    height: number
    data: Tile[][]
    buildings: Record<number, Building>
    buildingTypes: Record<number, BuildingType>
}

const buildingTypes: Record<number, BuildingType> = {
    1: { name: 'Wall', typeId: 1, size: 0.8 },
    2: { name: 'Turret', typeId: 2, size: 0.8 },
}

export async function getWorldMap() {
    return new Promise<MapData>((resolve) => {
        const img = new Image()
        img.onload = (ev) => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const gc = canvas.getContext('2d')
            gc.drawImage(img, 0, 0)
            const imgData = gc.getImageData(0, 0, canvas.width, canvas.height)
            const map: MapData = {
                width: canvas.width,
                height: canvas.height,
                data: [],
                buildings: {},
                buildingTypes,
            }
            for (let y = 0; y < map.height; y++) {
                const row: Tile[] = []
                for (let x = 0; x < map.width; x++) {
                    const col = imgData.data[y * map.width * 4 + x * 4]
                    row.push({ walkable: col > 128, building: null })
                }
                map.data.push(row)
            }
            resolve(map)
        }
        img.src = worldMapUrl
    })
}
