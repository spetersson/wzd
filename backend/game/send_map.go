package game

import (
	"github.com/spetersson/wzd/backend/hub"
	"go.mongodb.org/mongo-driver/bson"
)

func (game *Game) sendMap(client *hub.Client) {
	data := bson.M{
		"type":   "map",
		"width":  game.gameMap.Width(),
		"height": game.gameMap.Height(),
		"bytes":  game.gameMap.ToBytes(),
	}

	game.server.SendTo(client, data)
}
