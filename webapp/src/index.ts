import { WZDApp } from './app'

window.onload = async () => {
    try {
        const app = new WZDApp()
        await app.init()
    } catch (err) {
        console.error(err)
    }
}
