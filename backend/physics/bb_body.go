package physics

import (
	"log"

	m "github.com/spetersson/wzd/backend/math"
)

type BodyBB struct {
	bb  m.BB
	vel m.Vec
}

func NewBodyBB(bb m.BB, vel m.Vec) BodyBB {
	return BodyBB{
		bb:  bb,
		vel: vel,
	}
}

// Body interface
func (body *BodyBB) GetPos() m.Vec {
	return m.NewVec(body.bb.Left, body.bb.Top)
}
func (body *BodyBB) Move(delta m.Vec) {
	body.bb.Left += delta.X
	body.bb.Right += delta.X
	body.bb.Top += delta.Y
	body.bb.Bottom += delta.Y
}
func (body *BodyBB) Vel() *m.Vec {
	return &body.vel
}
func (body *BodyBB) GetBB() m.BB {
	return body.bb
}
func (a *BodyBB) Collide(b Body) *Collision {
	bCircle, ok := b.(*BodyCircle)
	if ok {
		return collideBBCircle(&a.bb, &bCircle.circle)
	}

	_, ok = b.(*BodyBB)
	if ok {
		log.Fatal("BB-BB collision is not implemented")
		return nil
	}

	log.Fatalf("BodyBB has not implemented collision for type %T", b)
	return nil
}

// Custom functions
func (b *BodyBB) SetBB(bb m.BB) {
	b.bb = bb
}
