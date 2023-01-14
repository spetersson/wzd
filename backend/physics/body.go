package physics

import m "github.com/spetersson/wzd/backend/math"

type Body interface {
	Vel() *m.Vec
	GetPos() m.Vec
	Move(delta m.Vec)
	GetBB() m.BB
	Collide(body Body) *Collision
}
