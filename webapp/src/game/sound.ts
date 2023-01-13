import song1Url from '@/assets/sounds/a_robust_crew.mp3'
import placeSoundUrl from '@/assets/sounds/place_building.mp3'
import walkGrassUrl from '@/assets/sounds/walk_grass.mp3'
import wooshUrl from '@/assets/sounds/woosh.mp3'
import { Settings, wait } from '@/utils'

export interface PlayOptions {
    delayMs?: number
    restart?: boolean
    loop?: boolean
}

export enum Sounds {
    START_GAME = 1,
    PLACE_BUILDING,
    STEP_GRASS_1,
    STEP_GRASS_2,
    STEP_GRASS_3,
    STEP_GRASS_4,
    SONG_1,
}

const STEPS = [Sounds.STEP_GRASS_1, Sounds.STEP_GRASS_2, Sounds.STEP_GRASS_3, Sounds.STEP_GRASS_4]
const MUSIC = [Sounds.SONG_1]
const NON_MUSIC = [
    Sounds.START_GAME,
    Sounds.PLACE_BUILDING,
    Sounds.STEP_GRASS_1,
    Sounds.STEP_GRASS_2,
    Sounds.STEP_GRASS_3,
    Sounds.STEP_GRASS_4,
]

export class Sound {
    private audios: Record<Sounds, HTMLAudioElement>
    private stepCounter: number = 0
    constructor() {
        this.audios = {
            [Sounds.PLACE_BUILDING]: new Audio(placeSoundUrl),
            [Sounds.SONG_1]: new Audio(song1Url),
            [Sounds.START_GAME]: new Audio(wooshUrl),
            [Sounds.STEP_GRASS_1]: new Audio(walkGrassUrl),
            [Sounds.STEP_GRASS_2]: new Audio(walkGrassUrl),
            [Sounds.STEP_GRASS_3]: new Audio(walkGrassUrl),
            [Sounds.STEP_GRASS_4]: new Audio(walkGrassUrl),
        }

        this.audios[Sounds.SONG_1].onerror = (event, source, lineno, colno, error) => {
            console.log(error)
        }

        this.audios[Sounds.SONG_1].volume = 0.4
        this.audios[Sounds.START_GAME].volume = 0.6
        this.audios[Sounds.STEP_GRASS_1].volume = 0.75
        this.audios[Sounds.STEP_GRASS_2].volume = 0.77
        this.audios[Sounds.STEP_GRASS_3].volume = 0.73
        this.audios[Sounds.STEP_GRASS_4].volume = 0.79

        this.setSound(Settings.get().soundOn)
        this.setMusic(Settings.get().musicOn)
    }

    async play(sound: Sounds, opts?: PlayOptions) {
        if (opts?.delayMs) {
            await wait(opts.delayMs)
        }

        if (opts?.restart) {
            if (!this.audios[sound].paused) {
                this.audios[sound].load()
            }
        } else if (!this.audios[sound].paused) {
            return
        }

        this.audios[sound].loop = Boolean(opts?.loop)
        await this.audios[sound].play()
    }

    async step() {
        this.stepCounter = (this.stepCounter + 1) % STEPS.length
        this.audios[STEPS[this.stepCounter]].loop = false
        this.audios[STEPS[this.stepCounter]].load()
        await this.audios[STEPS[this.stepCounter]].play()
    }

    soundMute() {
        this.setSound(false)
        Settings.update({ soundOn: false })
    }

    soundUnMute() {
        this.setSound(true)
        Settings.update({ soundOn: true })
    }

    musicMute() {
        this.setMusic(false)
        Settings.update({ musicOn: false })
    }

    musicUnMute() {
        this.setMusic(true)
        Settings.update({ musicOn: true })
    }

    private setSound(on: boolean) {
        const settings = Settings.get()
        if (on && !settings.musicOn) {
            for (const key of NON_MUSIC) {
                const sound = key as any as Sounds
                this.audios[sound].muted = !on
            }
        } else {
            for (const key in this.audios) {
                const sound = key as any as Sounds
                this.audios[sound].muted = !on
            }
        }
    }

    private setMusic(on: boolean) {
        const settings = Settings.get()
        if (on && !settings.soundOn) {
            return
        }

        for (const key of MUSIC) {
            const sound = key as any as Sounds
            this.audios[sound].muted = !on
        }
    }
}
