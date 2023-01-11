import { Store } from '@/utils'

export interface LoginResult {
    username: string
    host: string
}

export class Login {
    private joinContainer: HTMLDivElement
    private joinForm: HTMLFormElement
    private hostField: HTMLInputElement
    private nameField: HTMLInputElement
    private errorText: HTMLSpanElement

    constructor() {
        this.joinContainer = document.getElementById('join-container') as HTMLDivElement
        this.joinForm = document.getElementById('join-form') as HTMLFormElement
        this.hostField = document.getElementById('host-field') as HTMLInputElement
        this.nameField = document.getElementById('name-field') as HTMLInputElement
        this.errorText = document.getElementById('error-text') as HTMLInputElement

        this.nameField.value = Store.get().defaultUsername
    }

    focus() {
        this.nameField.focus()
    }
    unfocus() {
        this.nameField.blur()
    }
    show() {
        this.joinContainer.style.display = 'flex'
        this.hostField.value = location.host.split(':')[0] + ':7070'
    }
    hide() {
        this.joinContainer.style.display = 'none'
    }

    login() {
        return new Promise<LoginResult>((resolve, reject) => {
            const onSubmit = (ev: SubmitEvent) => {
                ev.preventDefault()

                const res = this.validate()
                if (res instanceof Error) {
                    reject(res)
                    return
                }

                Store.update({ defaultUsername: res.username })
                resolve(res)
            }
            this.joinForm.addEventListener('submit', onSubmit, { once: true, capture: true })
        })
    }

    validate(): LoginResult | Error {
        const res: LoginResult = {
            username: this.nameField.value,
            host: this.hostField.value,
        }
        res.username = res.username?.trim()
        res.host = res.host?.trim()

        if (!(res.host?.length > 0)) {
            return new Error(`Host is required`)
        }
        if (!(res.username?.length > 0)) {
            return new Error(`Username is required`)
        }

        return res
    }

    errorMsg(msg: string) {
        this.errorText.textContent = msg
    }
}
