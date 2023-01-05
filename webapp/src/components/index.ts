import { GetPacket } from '../server/packet-get'

export abstract class Component {
    constructor(private acceptPktTypes: GetPacket['type'][]) {}

    status: 'show' | 'hide'

    protected abstract _focus(): void
    protected abstract _unfocus(): void
    protected abstract _show(): void
    protected abstract _hide(): void
    abstract receive(pkg: GetPacket): void

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

    accepts() {
        return this.acceptPktTypes
    }
}
