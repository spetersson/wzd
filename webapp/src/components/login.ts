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
        return new Promise<LoginResult>((resolve) => {
            const onSubmit = (ev: SubmitEvent) => {
                ev.preventDefault()
                resolve({
                    username: this.nameField.value,
                    host: this.hostField.value,
                })
            }
            this.joinForm.addEventListener('submit', onSubmit, { once: true, capture: true })
        })
    }

    errorMsg(msg: string) {
        this.errorText.textContent = msg
    }
}
