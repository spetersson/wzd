import soundOffUrl from '@/assets/icons/sound_off.svg'
import soundOnUrl from '@/assets/icons/sound_on.svg'
import { Store } from '@/utils'

import { Sound } from '.'

const ICON_WIDTH = 40

export class MuteMenu {
    private muted = false
    private muteContainer: HTMLDivElement
    private soundOnElem: HTMLImageElement
    private soundOffElem: HTMLImageElement

    constructor(private sound: Sound) {
        this.muteContainer = document.getElementById('mute-container') as HTMLDivElement

        this.soundOnElem = document.createElement('img')
        this.soundOffElem = document.createElement('img')

        this.soundOnElem.src = soundOnUrl
        this.soundOnElem.onload = (ev: Event) => {
            this.soundOnElem.width = ICON_WIDTH
            this.soundOnElem.height = ICON_WIDTH
        }
        this.soundOffElem.src = soundOffUrl
        this.soundOffElem.onload = (ev: Event) => {
            this.soundOffElem.width = ICON_WIDTH
            this.soundOffElem.height = ICON_WIDTH
        }

        this.soundOnElem.className = 'icon-sound'
        this.soundOffElem.className = 'icon-sound'

        if (Store.get().soundOn) {
            this.muteContainer.appendChild(this.soundOnElem)
        } else {
            this.muteContainer.appendChild(this.soundOffElem)
        }
        this.muteContainer.onclick = () => this.onClick()
    }

    onClick() {
        if (this.muted) {
            this.sound.unMute()
            this.muteContainer.replaceChildren(this.soundOnElem)
        } else {
            this.sound.mute()
            this.muteContainer.replaceChildren(this.soundOffElem)
        }
        this.muted = !this.muted
    }
}
