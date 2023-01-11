export interface Settings {
    soundOn: boolean
    defaultUsername: string
}

const SETTINGS_KEY = 'settings'
const DEFAULT_SETTINGS: Settings = {
    soundOn: true,
    defaultUsername: '',
}

export class Store {
    static update(toUpdate: Partial<Settings>) {
        let currentSettings = Store.getSettings()
        currentSettings = { ...currentSettings, ...toUpdate }
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings))
    }

    static get() {
        return Store.getSettings()
    }

    private static getSettings(): Settings {
        const currentSettingsStr = localStorage.getItem(SETTINGS_KEY)
        return currentSettingsStr ? JSON.parse(currentSettingsStr) : { ...DEFAULT_SETTINGS }
    }
}
