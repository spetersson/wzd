package game

func (game *Game) update() {

	if len(game.players) == 0 {
		return
	}

	players := make([]dict, 0)
	for _, player := range game.players {
		players = append(players, dict{
			"username": player.Username,
			"pos": dict{
				"x": player.Pos.X,
				"y": player.Pos.Y,
			},
			"vel": dict{
				"x": player.Vel.X,
				"y": player.Vel.Y,
			},
		})
	}

	buildings := make([]dict, 0)
	for _, building := range game.gameMap.Buildings() {
		ix, iy := building.XY()
		buildings = append(buildings, dict{
			"id":     building.Id(),
			"typeId": building.TypeId(),
			"ix":     ix,
			"iy":     iy,
		})
	}

	game.server.SendAll(dict{
		"type":      "update",
		"players":   players,
		"buildings": buildings,
	})
}
