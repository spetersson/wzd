import { Component } from '.'

export interface LoginResult {
    username: string
    host: string
}

export class Login extends Component {
    private joinContainer: HTMLDivElement
    private joinForm: HTMLFormElement
    private hostField: HTMLInputElement
    private nameField: HTMLInputElement

    constructor() {
        super()
        this.joinContainer = document.getElementById(
            'join-container'
        ) as HTMLDivElement
        this.joinForm = document.getElementById('join-form') as HTMLFormElement
        this.hostField = document.getElementById(
            'host-field'
        ) as HTMLInputElement
        this.nameField = document.getElementById(
            'name-field'
        ) as HTMLInputElement
    }

    _focus() {
        this.nameField.focus()
    }
    _unfocus() {}
    _show() {
        this.joinContainer.style.display = 'flex'
    }
    _hide() {
        this.joinContainer.style.display = 'none'
    }

    login() {
        return new Promise<LoginResult>((resolve) => {
            this.joinForm.onsubmit = (evt: SubmitEvent) => {
                evt.preventDefault()
                resolve({
                    username: this.nameField.value,
                    host: this.hostField.value,
                })
            }
        })
    }
}
