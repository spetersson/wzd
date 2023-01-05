package game_map

func (gm *GameMap) Compress() map[string]any {
	result := make(map[string]any)
	result["width"] = gm.width
	result["height"] = gm.height

	tilesStr := ""
	for _, row := range gm.tiles {
		for _, tile := range row {
			if tile.Walkable {
				tilesStr += "X"
			} else {
				tilesStr += " "
			}
		}
	}
	result["tiles"] = tilesStr
	result["enemyBases"] = gm.enemyBases
	return result
}
