package vec

import "math"

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
