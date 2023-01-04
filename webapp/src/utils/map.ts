import worldMapUrl from '../assets/world.map.png'

export interface MapData {
    width: number
    height: number
    data: boolean[][]
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
            }
            for (let y = 0; y < map.height; y++) {
                const row: boolean[] = []
                for (let x = 0; x < map.width; x++) {
                    const col = imgData.data[y * map.width * 4 + x * 4]
                    row.push(col > 128)
                }
                map.data.push(row)
            }
            resolve(map)
        }
        img.src = worldMapUrl
    })
}
