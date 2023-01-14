package math

type Circle struct {
	Pos    Vec
	Radius float64
}

func NewCircle(pos Vec, radius float64) Circle {
	return Circle{
		Pos:    pos,
		Radius: radius,
	}
}

func (c Circle) GetBB() BB {
	return BB{
		Left:   c.Pos.X - c.Radius,
		Right:  c.Pos.X + c.Radius,
		Top:    c.Pos.Y - c.Radius,
		Bottom: c.Pos.Y + c.Radius,
	}
}
