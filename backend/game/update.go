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

	game.server.SendAll(dict{
		"type":      "update",
		"timestamp": game.timestamp,
		"players":   players,
	})
}
