export interface Vec {
    x: number
    y: number
}

export function Vec(): Vec
export function Vec(v: Vec): Vec
export function Vec(xy: number): Vec
export function Vec(x: number, y: number): Vec
export function Vec(arg1?: number | Vec, arg2?: number): Vec {
    if (typeof arg1 === 'object') {
        return {
            x: arg1.x,
            y: arg1.y,
        }
    } else if (typeof arg1 === 'number') {
        return {
            x: arg1,
            y: arg2 ?? arg1,
        }
    } else {
        return { x: 0, y: 0 }
    }
}

/**
 * Check if both `x` and `y` is 0
 */
export function isZero(a: Vec) {
    return a.x === 0 && a.y === 0
}
/**
 * Check if `a` is equal to `b`
 */
export function eq(a: Vec, b: Vec) {
    return a.x === b.x && a.y === b.y
}

/**
 * Returns dot product of `a` and `b`
 */
export function dot(a: Vec, b: Vec) {
    return a.x * b.x + a.y * b.y
}
/**
 * Returns `a + b`
 */
export function add(a: Vec, b: Vec): Vec {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    }
}
/**
 * Returns `a * s`
 */
export function mul(a: Vec, s: number): Vec {
    return {
        x: a.x * s,
        y: a.y * s,
    }
}
/**
 * Returns `a - b`
 */
export function sub(a: Vec, b: Vec): Vec {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
    }
}
export function normalized(a: Vec): Vec {
    const lenInv = 1 / Math.hypot(a.x, a.y)
    return {
        x: a.x * lenInv,
        y: a.y * lenInv,
    }
}
/**
 *
 */
export function mag(a: Vec) {
    return Math.sqrt(a.x * a.x + a.y * a.y)
}

// In-place function
/**
 * In-place addition: `a += b`
 */
export function iadd(a: Vec, b: Vec) {
    a.x += b.x
    a.y += b.y
}
/**
 * In-place subtraction: `a -= b`
 */
export function isub(a: Vec, b: Vec) {
    a.x -= b.x
    a.y -= b.y
}
/**
 * In-place multiplication: `a *= s`
 */
export function imul(a: Vec, s: number) {
    a.x *= s
    a.y *= s
}
/**
 * In-place normalization
 */
export function inormalize(a: Vec) {
    const lenInv = 1 / Math.sqrt(a.x * a.x + a.y * a.y)
    a.x *= lenInv
    a.y *= lenInv
}
