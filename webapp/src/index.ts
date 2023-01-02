import Game from './game'
import { getWorldMap } from './map'

window.onload = () => {
    const joinForm = document.getElementById('join-form') as HTMLFormElement
    const hostField = document.getElementById('host-field') as HTMLInputElement
    const nameField = document.getElementById('name-field') as HTMLInputElement
    joinForm.onsubmit = (evt: SubmitEvent) => {
        evt.preventDefault()
        startGame(hostField.value, nameField.value)
    }
}

async function startGame(host: string, nick: string) {
    const joinContainer = document.getElementById(
        'join-container'
    ) as HTMLDivElement
    const gameContainer = document.getElementById(
        'game-container'
    ) as HTMLDivElement
    const canvas = document.getElementById('canvas') as HTMLCanvasElement

    const worldMap = await getWorldMap()
    const game = new Game(worldMap)
    await game.join(host, nick)

    joinContainer.style.display = 'none'
    gameContainer.style.display = 'block'

    let width = 0,
        height = 0
    const resize = () => {
        width = gameContainer.clientWidth
        height = gameContainer.clientHeight
        canvas.width = width
        canvas.height = height
    }
    resize()
    window.onresize = resize

    const gc = canvas.getContext('2d')

    let lastTime = Date.now()
    const loop = async () => {
        const now = Date.now()
        await game.update((now - lastTime) / 1000)
        await game.draw(gc, width, height)

        lastTime = now
        requestAnimationFrame(loop)
    }
    loop()
}
