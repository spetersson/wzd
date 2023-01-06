package game_map

type BuildingType struct {
	typeId int
	size   float64
}

func (bt *BuildingType) Size() float64 {
	return bt.size
}

type Building struct {
	id     int
	typeId int
	ix     int
	iy     int
}

var buildingTypes = map[int]*BuildingType{
	1: {
		typeId: 1,
		size:   0.8,
	},
	2: {
		typeId: 2,
		size:   0.8,
	},
}

func (b *Building) Id() int {
	return b.id
}
func (b *Building) TypeId() int {
	return b.typeId
}
func (b *Building) XY() (int, int) {
	return b.ix, b.iy
}
func (b *Building) Type() *BuildingType {
	return buildingTypes[b.typeId]
}
