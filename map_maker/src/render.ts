type Color = [number, number, number]

const colorMap: [Color, Color][] = [
    [
        [0, 0, 0],
        [60, 70, 180],
    ],
    [
        [128, 128, 128],
        [200, 200, 200],
    ],
    [
        [255, 255, 255],
        [80, 190, 90],
    ],
]

function mapColor(key: Color): Color {
    for (const c of colorMap) {
        if (c[0][0] === key[0] && c[0][1] === key[1] && c[0][2] === key[2]) {
            return c[1]
        }
    }
    return [255, 0, 0]
}

export function draw(canvas: HTMLCanvasElement, img: ImageData, colored: boolean) {
    const w = img.width
    const h = img.height
    canvas.width = w
    canvas.height = h
    const gc = canvas.getContext('2d', { alpha: false })

    if (!colored) {
        gc.putImageData(img, 0, 0)
        return
    }

    const len = img.width * img.height * 4
    const colImg = gc.createImageData(img.width, img.height)
    for (let i = 0; i < len; i += 4) {
        const c = mapColor([img.data[i], img.data[i + 1], img.data[i + 2]])
        colImg.data[i] = c[0]
        colImg.data[i + 1] = c[1]
        colImg.data[i + 2] = c[2]
        colImg.data[i + 3] = 255
    }
    gc.putImageData(colImg, 0, 0)
}
