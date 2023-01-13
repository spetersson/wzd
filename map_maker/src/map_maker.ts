export interface Config {
    width: number
    height: number
    smoothLvl: number
    landImg: HTMLImageElement
    heightImg?: HTMLImageElement
    heightThr?: number
}

export async function generateMap(config: Config): Promise<ImageData> {
    const dw = Math.round(config.width)
    const dh = Math.round(config.height)
    const smoothLvl = Math.round(config.smoothLvl)

    if (!Number.isSafeInteger(dw) || dw < 0) {
        throw new Error('width not correct')
    }
    if (!Number.isSafeInteger(dh) || dh < 0) {
        throw new Error('height not correct')
    }
    if (!Number.isSafeInteger(smoothLvl) || smoothLvl < 0 || smoothLvl > 10) {
        throw new Error('smoothLvl not correct')
    }

    const maxScale = Math.max(
        Math.ceil(config.landImg.width / config.width),
        Math.ceil(config.landImg.height / config.height)
    )
    const scale = Math.min(smoothLvl + 1, maxScale)
    const sw = scale * dw
    const sh = scale * dh

    // Create land image source
    const canvasLand = document.createElement('canvas')
    canvasLand.width = sw
    canvasLand.height = sh
    let ic = canvasLand.getContext('2d', { alpha: false })
    ic.fillStyle = '#FFF'
    ic.fillRect(0, 0, sw, sh)
    ic.drawImage(config.landImg, 0, 0, sw, sh)

    const src = ic.getImageData(0, 0, sw, sh)
    const map = ic.createImageData(dw, dh)

    let si = 0
    let di = 0
    const iceWhiteThr = 150 * scale * scale
    for (let sy = 0; sy < sh; sy += scale) {
        for (let sx = 0; sx < sw; sx += scale) {
            let r = 0
            let g = 0
            let b = 0
            for (let oy = 0; oy < scale; oy++) {
                for (let ox = 0; ox < scale; ox++) {
                    const oi = si + (ox + oy * sw) * 4
                    r += src.data[oi]
                    g += src.data[oi + 1]
                    b += src.data[oi + 2]
                }
            }
            let col: number
            if ((b < r && b < g) || (r > iceWhiteThr && g > iceWhiteThr && b > iceWhiteThr)) {
                col = 255
            } else {
                col = 0
            }
            map.data[di] = col
            map.data[di + 1] = col
            map.data[di + 2] = col
            map.data[di + 3] = 255
            si += scale * 4
            di += 4
        }
        si += sw * (scale - 1) * 4
    }

    if (!config.heightImg) {
        return map
    }

    // Create height image source
    const canvasHeight = document.createElement('canvas')
    canvasHeight.width = sw
    canvasHeight.height = sh
    ic = canvasHeight.getContext('2d', { alpha: false })
    ic.fillStyle = '#FFF'
    ic.fillRect(0, 0, sw, sh)
    ic.drawImage(config.heightImg, 0, 0, sw, sh)
    si = 0
    di = 0
    const heightThr = config.heightThr * scale * scale * 3
    for (let sy = 0; sy < sh; sy += scale) {
        for (let sx = 0; sx < sw; sx += scale) {
            let sc = 0
            for (let oy = 0; oy < scale; oy++) {
                for (let ox = 0; ox < scale; ox++) {
                    const oi = si + (ox + oy * sw) * 4
                    sc += src.data[oi] + src.data[oi + 1] + src.data[oi + 2]
                }
            }
            if (sc > heightThr) {
                map.data[di] = 128
                map.data[di + 1] = 128
                map.data[di + 2] = 128
                map.data[di + 3] = 255
            }

            si += scale * 4
            di += 4
        }
        si += sw * (scale - 1) * 4
    }

    return map
}
