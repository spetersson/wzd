export * from './settings'
export * from './inputs'
export * from './keys'

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
