package physics

import (
	"log"

	m "github.com/spetersson/wzd/backend/math"
)

type BodyCircle struct {
	circle m.Circle
	vel    m.Vec
}

func NewBodyCircle(circle m.Circle, vel m.Vec) BodyCircle {
	return BodyCircle{
		circle: circle,
		vel:    vel,
	}
}

// Body interface
func (cb *BodyCircle) GetPos() m.Vec {
	return cb.circle.Pos
}
func (body *BodyCircle) Move(delta m.Vec) {
	body.circle.Pos.IAdd(delta)
}
func (cb *BodyCircle) Vel() *m.Vec {
	return &cb.vel
}
func (cb *BodyCircle) GetBB() m.BB {
	return cb.circle.GetBB()
}
func (a *BodyCircle) Collide(b Body) *Collision {
	bCircle, ok := b.(*BodyCircle)
	if ok {
		return collideCircleCircle(&a.circle, &bCircle.circle)
	}

	bBB, ok := b.(*BodyBB)
	if ok {
		collision := collideBBCircle(&bBB.bb, &a.circle)
		if collision != nil {
			// Flip normal so if follows convention
			collision.Norm.INeg()
		}
		return collision
	}

	log.Fatalf("BodyCircle has not implemented collision for type %T", b)
	return nil
}

// Custom functions
func (cb BodyCircle) Circle() *m.Circle {
	return &cb.circle
}
