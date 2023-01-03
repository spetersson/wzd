export abstract class Component {
    status: 'show' | 'hide'

    protected _focus() {}
    protected _unfocus() {}
    protected _show() {}
    protected _hide() {}

    focus() {
        this._focus()
    }
    unfocus() {
        this._unfocus()
    }
    show() {
        this.status = 'show'
        this._show()
    }
    hide() {
        this.status = 'hide'
        this._unfocus()
        this._hide()
    }
}
