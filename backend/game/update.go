package game

import (
	"go.mongodb.org/mongo-driver/bson"
)

func (game *Game) update() {
	if len(game.players) == 0 {
		return
	}

	players := make(bson.A, 0)
	for _, player := range game.players {
		players = append(players, bson.M{
			"username": player.Username,
			"pos": bson.M{
				"x": player.Body.GetPos().X,
				"y": player.Body.GetPos().Y,
			},
			"vel": bson.M{
				"x": player.Body.Vel().X,
				"y": player.Body.Vel().Y,
			},
			"dir": bson.M{
				"x": player.Dir.X,
				"y": player.Dir.Y,
			},
		})
	}

	buildings := make(bson.A, 0)
	for _, building := range game.gameMap.Buildings() {
		ix, iy := building.XY()
		buildings = append(buildings, bson.M{
			"id":     building.Id(),
			"typeId": building.TypeId(),
			"ix":     ix,
			"iy":     iy,
		})
	}

	enemies := make(bson.A, 0)
	for _, enemy := range game.enemies {
		enemies = append(enemies, bson.M{
			"id": enemy.Id,
			"pos": bson.M{
				"x": enemy.body.GetPos().X,
				"y": enemy.body.GetPos().X,
			},
		})
	}

	game.server.SendAll(bson.M{
		"type":      "update",
		"players":   players,
		"buildings": buildings,
		"enemies":   enemies,
	})
}
