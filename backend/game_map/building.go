package game_map

type Building struct {
	id     int
	typeId int
	ix     int
	iy     int
}

func (b *Building) Id() int {
	return b.id
}
func (b *Building) TypeId() int {
	return b.id
}
func (b *Building) XY() (int, int) {
	return b.ix, b.iy
}
