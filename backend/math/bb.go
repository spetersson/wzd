package math

type BB struct {
	Left   float64
	Right  float64
	Top    float64
	Bottom float64
}

func NewBB(left, right, top, bottom float64) BB {
	return BB{
		Left:   left,
		Right:  right,
		Top:    top,
		Bottom: bottom,
	}
}
func NewCircleBB(pos Vec, rad float64) BB {
	return BB{
		Left:   pos.X - rad,
		Right:  pos.X + rad,
		Top:    pos.Y - rad,
		Bottom: pos.Y + rad,
	}
}

func (bb *BB) Mid() Vec {
	return Vec{
		X: (bb.Right - bb.Left) * 0.5,
		Y: (bb.Bottom - bb.Top) * 0.5,
	}
}

func (a *BB) Overlaps(b *BB) bool {
	return a.Left < b.Right && b.Left < a.Right && a.Top < b.Bottom && b.Top < a.Bottom
}
