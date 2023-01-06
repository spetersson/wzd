package game_map

type Tile struct {
	walkable bool
	building *Building
}

func (t *Tile) Walkable() bool {
	return t.walkable
}
func (t *Tile) Building() *Building {
	return t.building
}
