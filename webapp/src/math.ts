export interface Vec {
    x: number
    y: number
}

export function Vec(): Vec
export function Vec(x: number, y: number): Vec
export function Vec(x?: number, y?: number): Vec {
    if (typeof x !== 'number') {
        return { x: 0, y: 0 }
    }
    return { x, y }
}

export function isZero(a: Vec) {
    return a.x === 0 && a.y === 0
}

export function dot(a: Vec, b: Vec) {
    return a.x * b.x + a.y * b.y
}
export function add(a: Vec, b: Vec): Vec {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    }
}
export function mul(a: Vec, s: number): Vec {
    return {
        x: a.x * s,
        y: a.y * s,
    }
}
export function sub(a: Vec, b: Vec): Vec {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
    }
}

// In-place function
export function iadd(a: Vec, b: Vec) {
    a.x += b.x
    a.y += b.y
}
export function imul(a: Vec, s: number) {
    a.x *= s
    a.y *= s
}
export function inormalize(a: Vec) {
    const lenInv = 1 / Math.sqrt(a.x * a.x + a.y * a.y)
    a.x *= lenInv
    a.y *= lenInv
}
