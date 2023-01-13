import { Config, generateMap } from './map_maker'
import { draw } from './render'

const DOWNLOAD_NAME = 'world.map.png'

async function fileToImg(file: File) {
    return new Promise<HTMLImageElement>((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
            const img = new Image()
            img.onload = () => {
                resolve(img)
            }
            img.src = ev.target.result as string
        }
        reader.readAsDataURL(file)
    })
}

async function downloadMap(map: ImageData, name: string) {
    const canvas = document.createElement('canvas')
    canvas.width = map.width
    canvas.height = map.height
    const gc = canvas.getContext('2d', { alpha: false })
    gc.putImageData(map, 0, 0)

    const a = document.createElement('a')
    a.download = name
    a.href = canvas.toDataURL()
    a.click()
}

async function main() {
    const view = document.getElementById('view') as HTMLDivElement
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const resize = () => {
        const vw = view.clientWidth
        const vh = view.clientHeight
        const scale = Math.min(vw / canvas.width, vh / canvas.height)
        canvas.style.width = `${canvas.width * scale}px`
        canvas.style.height = `${canvas.height * scale}px`
    }
    window.onresize = resize

    const landImgInput = document.getElementById('in-land-img') as HTMLInputElement
    const heightImgInput = document.getElementById('in-height-img') as HTMLInputElement
    const widthInput = document.getElementById('in-width') as HTMLInputElement
    const heightInput = document.getElementById('in-height') as HTMLInputElement
    const heightThrInput = document.getElementById('in-height-thr') as HTMLInputElement
    const smoothInput = document.getElementById('in-smooth') as HTMLInputElement
    const btnRefresh = document.getElementById('btn-refresh') as HTMLButtonElement
    const btnColor = document.getElementById('btn-color') as HTMLButtonElement
    const btnDownload = document.getElementById('btn-download') as HTMLButtonElement

    let map: ImageData
    let colored = true

    const config: Partial<Config> = {
        width: Number(widthInput.value || 900),
        height: Number(heightInput.value || 600),
        smoothLvl: Number(smoothInput.value || 0),
        heightThr: Number(heightThrInput.value || 0),
    }

    const validate = (conf: Partial<Config>): Config => {
        if (!conf.landImg) {
            console.log('Missing land image')
            return null
        }
        if (!Number.isSafeInteger(conf.width) || conf.width < 1 || conf.width > 4000) {
            console.log('Invalid width')
            return null
        }
        if (!Number.isSafeInteger(conf.height) || conf.height < 1 || conf.height > 4000) {
            console.log('Invalid height')
            return null
        }
        if (!Number.isSafeInteger(conf.smoothLvl) || conf.smoothLvl < 0 || conf.smoothLvl > 6) {
            console.log('Invalid smooth level')
            return null
        }
        if (conf.heightImg && (!Number.isSafeInteger(conf.heightThr) || conf.heightThr < 0 || conf.heightThr > 255)) {
            console.log('Invalid height threshold')
            return null
        }
        return { ...conf } as Config
    }

    const generate = async () => {
        const validConf = validate(config)
        if (!validConf) {
            return
        }
        map = await generateMap(validConf)
        draw(canvas, map, colored)
        resize()
    }

    widthInput.value = String(config.width)
    heightInput.value = String(config.height)
    smoothInput.value = String(config.smoothLvl)

    const loadLandImg = async () => {
        if (landImgInput.files.length === 0) {
            return
        }
        config.landImg = await fileToImg(landImgInput.files[0])
        await generate()
    }
    landImgInput.onchange = loadLandImg
    const loadHeightImg = async () => {
        if (heightImgInput.files.length === 0) {
            return
        }
        config.heightImg = await fileToImg(heightImgInput.files[0])
        await generate()
    }
    heightImgInput.onchange = loadHeightImg
    heightThrInput.onchange = async () => {
        console.log('change')
        config.heightThr = Number(heightThrInput.value)
        await generate()
    }
    widthInput.onchange = async () => {
        config.width = Number(widthInput.value)
        await generate()
    }
    heightInput.onchange = async () => {
        config.height = Number(heightInput.value)
        await generate()
    }
    smoothInput.onchange = async () => {
        config.smoothLvl = Number(smoothInput.value)
        await generate()
    }
    btnRefresh.onclick = async () => {
        await generate()
    }
    btnColor.onclick = async () => {
        colored = !colored
        if (map) {
            draw(canvas, map, colored)
        }
    }
    btnDownload.onclick = async () => {
        if (map) {
            await downloadMap(map, DOWNLOAD_NAME)
        }
    }

    await loadLandImg()
    await loadHeightImg()
    await generate()
}

window.onload = main
