package game

import (
	"fmt"
	"log"

	"github.com/spetersson/wzd/backend/hub"
	m "github.com/spetersson/wzd/backend/math"
	"go.mongodb.org/mongo-driver/bson"
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
		pos, ok2 := data["pos"].(dict)
		if !ok1 || !ok2 {
			log.Printf("Failed to parse join packet %v", data)
			return
		}
		x, ok3 := pos["x"].(float64)
		y, ok4 := pos["y"].(float64)
		if !ok3 || !ok4 {
			log.Printf("Failed to parse join packet %v", data)
			return
		}

		if client := game.findUsername(username); client != nil {
			delete(game.players, client)
		}

		game.players[client] = &Player{
			Username:  username,
			Pos:       m.NewVec(x, y),
			Vel:       m.NewVec(0, 0),
			Dir:       m.NewVec(0, 0),
			Sprinting: false,
		}
		serverMsg := fmt.Sprintf("Player %s has joined", username)

		game.sendMap(client)
		game.server.SendAll(bson.M{
			"type":    "message",
			"message": serverMsg,
		})
		log.Print(serverMsg)

	case "move":
		dirData, ok1 := data["dir"].(dict)
		if !ok1 {
			log.Printf("Failed to parse move packet %v", data)
			return
		}
		x, ok2 := dirData["x"].(float64)
		y, ok3 := dirData["y"].(float64)
		sprinting, ok4 := data["sprinting"].(bool)
		if !ok2 || !ok3 || !ok4 {
			log.Printf("Failed to parse move packet %v", data)
			return
		}
		dir := m.NewVec(x, y)
		if !dir.IsZero() {
			dir.INormalize()
		}
		game.players[client].Dir = dir
		game.players[client].Sprinting = sprinting

	case "build":
		typeId, ok1 := data["typeId"].(int32)
		idx, ok2 := data["idx"].(dict)
		if !ok1 || !ok2 {
			log.Printf("Failed to parse build packet %v", data)
			return
		}
		ix, ok3 := idx["x"].(int32)
		iy, ok4 := idx["y"].(int32)
		if !ok3 || !ok4 {
			log.Printf("Failed to parse build packet %v", data)
			return
		}

		if game.gameMap.At(int(ix), int(iy)).Building() != nil {
			log.Print("Trying to place building on top of building")
			return
		}
		game.gameMap.Place(int(typeId), int(ix), int(iy))

	case "chat":
		message, ok := data["message"].(string)

		if !ok {
			log.Printf("Failed to parse message packet %v", data)
		}

		log.Printf("Player " + game.players[client].Username + " wrote: " + message)

		game.server.SendAll(bson.M{
			"type":     "message",
			"username": game.players[client].Username,
			"message":  message,
		})

	case "ping":
		timestamp, ok := data["timestamp"].(float64)
		if !ok {
			log.Printf("Failed to parse ping packet %v", data)
			return
		}
		game.server.SendTo(client, bson.M{
			"type":      "pong",
			"timestamp": timestamp,
		})

	}
}
