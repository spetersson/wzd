package game

import (
	"log"

	"github.com/spetersson/wzd/backend/hub"
	"github.com/spetersson/wzd/backend/vec"
)

func (game *Game) receive(client *hub.Client, data dict) {
	pType, ok := data["type"].(string)
	if !ok {
		log.Printf("Packet does not have a type %v", data)
		return
	}

	switch pType {
	case "join":
		username, ok1 := data["username"].(string)
		x, ok2 := data["x"].(float64)
		y, ok3 := data["y"].(float64)
		if !ok1 || !ok2 || !ok3 {
			log.Printf("Failed to parse join packet %v", data)
			return
		}
		game.players[client] = &Player{
			Username:  username,
			Pos:       vec.NewVec(x, y),
			Vel:       vec.NewVec(0, 0),
			Dir:       vec.NewVec(0, 0),
			Sprinting: false,
		}
		log.Printf("Player %s joined", username)

	case "move":
		x, ok1 := data["x"].(float64)
		y, ok2 := data["y"].(float64)
		if !ok1 || !ok2 {
			log.Printf("Failed to parse join packet %v", data)
			return
		}
		dir := vec.NewVec(x, y)
		if !dir.IsZero() {
			dir.INormalize()
		}
		game.players[client].Dir = dir

	case "chat":
		message, ok := data["message"].(string)

		if !ok {
			log.Printf("Failed to parse message packet %v", data)
		}

		log.Printf("Player " + game.players[client].Username + " wrote: " + message)

		packet := make(dict)
		packet["type"] = "message"
		packet["username"] = game.players[client].Username
		packet["message"] = message

		game.server.SendAll(packet)

	case "ping":
		timestamp, ok := data["timestamp"].(float64)
		if !ok {
			log.Printf("Failed to parse ping packet %v", data)
			return
		}
		game.server.SendTo(client, dict{
			"type":      "ping",
			"timestamp": timestamp,
		})

	}
}
