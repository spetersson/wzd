export interface SettingsData {
    soundOn: boolean
    musicOn: boolean
    defaultUsername: string
}

const SETTINGS_KEY = 'settings'
const DEFAULT_SETTINGS: SettingsData = {
    soundOn: true,
    musicOn: true,
    defaultUsername: '',
}

export class Settings {
    static update(toUpdate: Partial<SettingsData>) {
        let currentSettings = Settings.getSettings()
        currentSettings = { ...currentSettings, ...toUpdate }
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings))
    }

    static get() {
        return Settings.getSettings()
    }

    private static getSettings(): SettingsData {
        const currentSettingsStr = localStorage.getItem(SETTINGS_KEY)
        return currentSettingsStr ? JSON.parse(currentSettingsStr) : { ...DEFAULT_SETTINGS }
    }
}
