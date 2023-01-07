package game_map

func (gm *GameMap) ToBytes() []byte {
	size := gm.width * gm.height
	result := make([]byte, size)
	i := 0
	for y := 0; y < gm.height; y++ {
		for x := 0; x < gm.width; x++ {
			var value byte
			if gm.tiles[y][x].walkable {
				value = 1
			} else {
				value = 0
			}
			result[i] = value
			i++
		}
	}

	return result
}
