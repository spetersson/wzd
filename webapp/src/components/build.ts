import { Component } from '.'
import Connection from '../server/connection'
import { GetPacket } from '../server/packet-get'
import { toInt32 } from '../server/types'
import { BuildingType } from '../utils/map'
import { Vec } from '../utils/math'
import Game from './game'

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

        for (const typeId in this.game.map.buildingTypes) {
            const buildingType = this.game.map.buildingTypes[typeId]
            const element = document.createElement('div')
            element.textContent = buildingType.name.toUpperCase()
            element.onclick = () => {
                this.onSelectItem(buildingType)
            }
            this.gridContainer.appendChild(element)
        }
    }

    onSelectItem(type: BuildingType) {
        const ix = Math.floor(this.game.user.pos.x)
        const iy = Math.floor(this.game.user.pos.y)

        console.log(
            `Placing ${type.name} of type ${type.typeId} at (${ix},${iy})`
        )

        this.conn.send({
            type: 'build',
            typeId: toInt32(type.typeId),
            idx: toInt32(Vec(ix, iy)),
        })
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
