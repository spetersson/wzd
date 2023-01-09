import { Consts } from '@/constants'
import { BuildingType } from '@/utils/map'

export type SelectBuildingCallback = (buildingType: BuildingType) => void

export class BuildMenu {
    status: 'selecting' | 'closed'
    buildContainer: HTMLDivElement
    gridContainer: HTMLDivElement
    callback?: SelectBuildingCallback

    constructor() {
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
        if (typeof this.callback === 'function') {
            this.callback(type)
        }
    }

    selectBuilding(callback: SelectBuildingCallback) {
        this.status = 'selecting'
        this.buildContainer.style.display = 'flex'
        this.callback = callback
    }
    close() {
        this.status = 'closed'
        this.buildContainer.style.display = 'none'
        this.callback = null
    }
}
