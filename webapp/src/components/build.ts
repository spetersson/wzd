import { Component } from '.'
import Connection from '../server/connection'
import { GetPacket } from '../server/packet-get'
import Game from './game'

const ITEMS = ['TURRET']
export default class Build extends Component {
    buildContainer: HTMLDivElement
    gridContainer: HTMLDivElement

    constructor(private conn: Connection, private game: Game) {
        super([])
        this.buildContainer = document.getElementById(
            'build-container'
        ) as HTMLDivElement
        this.gridContainer = document.getElementById(
            'grid-container'
        ) as HTMLDivElement

        const elements = ITEMS.map((item) => {
            const element = document.createElement('div')
            element.textContent = item
            element.onclick = () => {
                this.onSelectItem(item)
            }
            return element
        })

        this.gridContainer.append(...elements)
    }

    onSelectItem(item: string) {
        const ix = Math.floor(this.game.pos.x)
        const iy = Math.floor(this.game.pos.y)

        console.log(`Placing ${item} at (${ix},${iy})`)

        this.conn.send({ type: 'build', typeId: 1, ix, iy })
    }

    _focus() {}
    _unfocus() {}
    _show() {
        this.buildContainer.style.display = 'flex'
    }
    _hide() {
        this.buildContainer.style.display = 'none'
    }
    receive(pkg: GetPacket) {}
}
