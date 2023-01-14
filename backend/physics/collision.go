package physics

import (
	"math"

	m "github.com/spetersson/wzd/backend/math"
)

type Collision struct {
	Pos m.Vec
	// Unit vector that points from the collision point to the first body in a collision function.
	// So if you have collision function for object A and B like this:
	//  Collide(A, B) // Norm point to A
	// Or if it's used like this:
	//  A.Collide(B) // It also points to A
	Norm    m.Vec
	Overlap float64
}

func collideBBCircle(a *m.BB, b *m.Circle) *Collision {

	halfW := (a.Right - a.Left) * 0.5
	halfH := (a.Bottom - a.Top) * 0.5
	aMid := m.NewVec(a.Left+halfW, a.Top+halfH)
	delta := b.Pos.Sub(aMid)
	// Line to collide with
	var linePos m.Vec
	var lineNorm m.Vec

	if math.Abs(delta.X) >= halfW && math.Abs(delta.Y) > halfH {
		// Corner collision
		linePos = m.NewVec(
			aMid.X+m.Sign(delta.X)*halfW,
			aMid.Y+m.Sign(delta.Y)*halfH,
		)
		lineNorm = b.Pos.Sub(linePos)
		if lineNorm.IsZero() {
			// In case b is exactly on a corner
			// Set lineNorm to 45deg pointing out from the a
			lineNorm.X = m.Sign(delta.X)
			lineNorm.Y = m.Sign(delta.Y)
		}
		lineNorm.INormalize()
	} else if math.Abs(delta.X) > math.Abs(delta.Y) {
		// Horizontal
		linePos = m.NewVec(aMid.X+halfW*m.Sign(delta.X), aMid.Y)
		lineNorm = m.NewVec(m.Sign(delta.X), 0)
	} else {
		// Vertical
		lineNorm = m.NewVec(0, m.Sign(delta.Y))
		linePos = m.NewVec(aMid.X, aMid.Y+halfH*m.Sign(delta.Y))
	}

	// Project A pos onto line normal
	relPos := b.Pos.Sub(linePos)
	dist := relPos.Dot(lineNorm)

	// Check if A is outside B
	if dist > b.Radius {
		return nil
	}
	overlap := b.Radius - dist
	pos := b.Pos.Sub(lineNorm.Mul(b.Radius - overlap*0.5))

	return &Collision{
		Pos:     pos,
		Norm:    lineNorm.Neg(),
		Overlap: overlap,
	}
}

func collideCircleCircle(a, b *m.Circle) *Collision {
	delta := a.Pos.Sub(b.Pos)
	if delta.IsZero() {
		// In case a is exactly on top of b
		return &Collision{
			Pos:     a.Pos,
			Norm:    m.NewVec(1, 0),
			Overlap: a.Radius + b.Radius,
		}
	}

	dist := delta.Mag()
	if dist > a.Radius+b.Radius {
		return nil
	}

	return &Collision{
		Pos:     a.Pos.Add(b.Pos).Mul(0.5),
		Norm:    delta.Normalized(),
		Overlap: a.Radius + b.Radius - dist,
	}
}
