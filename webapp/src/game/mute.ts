import soundOffUrl from '@/assets/icons/sound_off.svg'
import soundOnUrl from '@/assets/icons/sound_on.svg'
import musicOffUrl from '@/assets/icons/music_off.svg'
import musicOnUrl from '@/assets/icons/music_on.svg'
import { Settings } from '@/utils'

import { Sound } from '.'

const ICON_WIDTH = 40

interface MuteBtnElems {
    container: HTMLDivElement
    onElem: HTMLImageElement
    offElem: HTMLImageElement
}

export class MuteMenu {
    private muteContainer: HTMLDivElement
    private soundElems: MuteBtnElems
    private musicElems: MuteBtnElems

    constructor(private sound: Sound) {
        this.muteContainer = document.getElementById('mute-container') as HTMLDivElement
        this.soundElems = {
            container: document.createElement('div'),
            onElem: this.createIcon(soundOnUrl),
            offElem: this.createIcon(soundOffUrl),
        }
        this.musicElems = {
            container: document.createElement('div'),
            onElem: this.createIcon(musicOnUrl),
            offElem: this.createIcon(musicOffUrl),
        }

        this.setIcon(this.soundElems, Settings.get().soundOn)
        this.setIcon(this.musicElems, Settings.get().musicOn)

        this.soundElems.container.onclick = () => this.onClickSound()
        this.musicElems.container.onclick = () => this.onClickMusic()

        this.muteContainer.append(this.soundElems.container, this.musicElems.container)
    }

    private onClickSound() {
        let isOn = Settings.get().soundOn
        if (isOn) {
            this.sound.soundMute()
        } else {
            this.sound.soundUnMute()
        }
        this.setIcon(this.soundElems, !isOn)
    }
    private onClickMusic() {
        let isOn = Settings.get().musicOn
        if (isOn) {
            this.sound.musicMute()
        } else {
            this.sound.musicUnMute()
        }
        this.setIcon(this.musicElems, !isOn)
    }

    private createIcon(url: string) {
        const img = document.createElement('img')
        img.className = 'icon-sound'
        img.onload = (ev: Event) => {
            img.width = ICON_WIDTH
            img.height = ICON_WIDTH
        }
        img.src = url
        return img
    }

    private setIcon(elems: MuteBtnElems, on: boolean) {
        elems.container.replaceChildren(on ? elems.onElem : elems.offElem)
    }
}
