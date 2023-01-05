package game

import (
	"encoding/json"
	"log"
)

func (game *Game) sendMap() {
	data, err := json.Marshal(dict{
		"type": "map",
		"map":  game.gameMap.Compress(),
	})

	if err != nil {
		log.Fatal("Failed to Marshal map")
	}

	// TODO: Send data to player (or return data)
	_ = data
}
