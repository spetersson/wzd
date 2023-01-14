package math

import "math"

type Vec struct {
	X float64
	Y float64
}

func NewVec(x, y float64) Vec {
	return Vec{X: x, Y: y}
}

func (v *Vec) Set(x, y float64) {
	v.X, v.Y = x, y
}

func (a *Vec) SetV(b Vec) {
	a.X, a.Y = b.X, b.Y
}

func (v Vec) Get() (x, y float64) {
	return v.X, v.Y
}

func (v Vec) Neg() Vec {
	v.X, v.Y = -v.X, -v.Y
	return v
}

func (v Vec) IsZero() bool {
	return v.X == 0 && v.Y == 0
}

func (a Vec) Add(b Vec) Vec {
	a.X += b.X
	a.Y += b.Y
	return a
}

func (a Vec) Sub(b Vec) Vec {
	a.X -= b.X
	a.Y -= b.Y
	return a
}

func (a Vec) Mul(s float64) Vec {
	a.X *= s
	a.Y *= s
	return a
}

func (a Vec) Dot(b Vec) float64 {
	return a.X*b.X + a.Y*b.Y
}

func (a Vec) Normalized() Vec {
	lenInv := 1.0 / math.Hypot(a.X, a.Y)
	a.X *= lenInv
	a.Y *= lenInv
	return a
}

func (a Vec) Mag() float64 {
	return math.Hypot(a.X, a.Y)
}

// In-place operations

func (a *Vec) INeg() {
	a.X, a.Y = -a.X, -a.Y
}

func (a *Vec) IAdd(b Vec) {
	a.X += b.X
	a.Y += b.Y
}

func (a *Vec) ISub(b Vec) {
	a.X -= b.X
	a.Y -= b.Y
}

func (a *Vec) IMul(s float64) {
	a.X *= s
	a.Y *= s
}

func (a *Vec) INormalize() {
	lenInv := 1.0 / math.Hypot(a.X, a.Y)
	a.X *= lenInv
	a.Y *= lenInv
}
