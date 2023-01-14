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

func (bb BB) Mid() Vec {
	return Vec{
		X: (bb.Right - bb.Left) * 0.5,
		Y: (bb.Bottom - bb.Top) * 0.5,
	}
}

func (a BB) Overlaps(b *BB) bool {
	return a.Left < b.Right && b.Left < a.Right && a.Top < b.Bottom && b.Top < a.Bottom
}

func (bb *BB) AddPoint(p *Vec) {
	if p.X < bb.Left {
		bb.Left = p.X
	} else if p.X > bb.Right {
		bb.Right = p.X
	}
	if p.Y < bb.Top {
		bb.Top = p.Y
	} else if p.Y > bb.Bottom {
		bb.Bottom = p.Y
	}
}

func (a *BB) AddBB(b *BB) {
	if b.Left < a.Left {
		a.Left = b.Left
	}
	if b.Right > a.Right {
		a.Right = b.Right
	}
	if b.Top < a.Top {
		a.Top = b.Top
	}
	if b.Bottom > a.Bottom {
		a.Bottom = b.Bottom
	}
}

func (bb BB) GetIdx() (iLeft, iRight, iTop, iBottom int) {
	return int(bb.Left), int(bb.Right), int(bb.Top), int(bb.Bottom)
}
