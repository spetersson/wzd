package math

import "math"

type Vec struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

func NewVec(x, y float64) Vec {
	return Vec{X: x, Y: y}
}

func (v Vec) IsZero() bool {
	return v.X == 0 && v.Y == 0
}

func (a Vec) Add(b Vec) Vec {
	return Vec{
		X: a.X + b.X,
		Y: a.Y + b.Y,
	}
}

func (a Vec) Sub(b Vec) Vec {
	return Vec{
		X: a.X - b.X,
		Y: a.Y - b.Y,
	}
}

func (a Vec) Mul(s float64) Vec {
	return Vec{
		X: a.X * s,
		Y: a.Y * s,
	}
}

func (a Vec) Dot(b Vec) float64 {
	return a.X*b.X + a.Y*b.Y
}

func (a Vec) Normalized() Vec {
	lenInv := 1.0 / math.Hypot(a.X, a.Y)
	return Vec{
		X: a.X * lenInv,
		Y: a.Y * lenInv,
	}
}

func (a Vec) Mag() float64 {
	return math.Sqrt(a.X*a.X + a.Y*a.Y)
}

func (a Vec) Neg() Vec {
	return Vec{
		X: -a.X,
		Y: -a.Y,
	}
}

// In-place operations

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
