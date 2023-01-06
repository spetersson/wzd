package vec

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
