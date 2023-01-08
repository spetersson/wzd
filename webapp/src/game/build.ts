import Game from '@/game'
import { Consts } from '@/constants'
import Connection from '@/server/connection'
import { toInt32 } from '@/server/types'
import { BuildingType } from '@/utils/map'
import { Vec } from '@/utils/math'

export class BuildMenu {
    status: 'show' | 'hide'
    buildContainer: HTMLDivElement
    gridContainer: HTMLDivElement

    constructor(private conn: Connection, private game: Game) {
        this.buildContainer = document.getElementById('build-container') as HTMLDivElement
        this.gridContainer = document.getElementById('grid-container') as HTMLDivElement

        for (const typeId in Consts.BUILDING_TYPES) {
            const buildingType = Consts.BUILDING_TYPES[typeId]
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

        console.log(`Placing ${type.name} of type ${type.typeId} at (${ix},${iy})`)

        this.conn.send({
            type: 'build',
            typeId: toInt32(type.typeId),
            idx: toInt32(Vec(ix, iy)),
        })
    }

    show() {
        this.status = 'show'
        this.buildContainer.style.display = 'flex'
    }
    hide() {
        this.status = 'hide'
        this.buildContainer.style.display = 'none'
    }
    toogle() {
        if (this.status === 'show') {
            this.hide()
        } else {
            this.show()
        }
    }
}
