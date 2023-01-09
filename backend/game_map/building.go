package game_map

const (
	BUILDING_TYPE_WALL = iota + 1
	BUILDING_TYPE_TURRET
	BUILDING_TYPE_ENEMY_BASE
)

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
	BUILDING_TYPE_WALL: {
		typeId: BUILDING_TYPE_WALL,
		size:   0.8,
	},
	BUILDING_TYPE_TURRET: {
		typeId: BUILDING_TYPE_TURRET,
		size:   0.8,
	},
	BUILDING_TYPE_ENEMY_BASE: {
		typeId: BUILDING_TYPE_ENEMY_BASE,
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
