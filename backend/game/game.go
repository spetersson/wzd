package game

import (
	"encoding/json"
	"log"
	"time"

	"github.com/spetersson/wzd/backend/game_map"
	"github.com/spetersson/wzd/backend/hub"
	"github.com/spetersson/wzd/backend/vec"
)

const (
	LOOP_INTERVAL   = time.Second / 60
	UPDATE_INTERVAL = time.Second / 30
)

func NewGame(server *hub.Hub) *Game {
	return &Game{
		server:  server,
		gameMap: game_map.GetMap(),
		players: make(map[*hub.Client]*Player),
		enemies: make(map[int]*Enemy),
		done:    make(chan bool),
	}
}

// Halting function that runs the game
func (g *Game) Run() {
	// Main game loop
	loopTicker := time.NewTicker(LOOP_INTERVAL)
	updateTicker := time.NewTicker(UPDATE_INTERVAL)
	lastTime := time.Now().UnixMilli()
	for {
		select {
		case <-loopTicker.C:
			now := time.Now().UnixMilli()
			dt := float64(now-lastTime) / 1000.0
			g.loop(dt)
			lastTime = now
		case <-updateTicker.C:
			g.update()
		case packet := <-g.server.Receiver():
			g.receive(packet.Client, packet.Data)
		case client := <-g.server.Unregister():
			if player, ok := g.players[client]; ok {
				log.Printf("Player %s left", player.Username)
			}
			delete(g.players, client)
		}
	}
}

func (g *Game) update() {

	if len(g.players) == 0 {
		return
	}

	packet := make(map[string]any)
	list := make([]map[string]any, 0)
	for _, p := range g.players {
		playerData := make(map[string]any)
		playerData["username"] = p.Username
		playerData["x"] = p.Pos.X
		playerData["y"] = p.Pos.Y
		list = append(list, playerData)
	}
	packet["type"] = "update"
	packet["players"] = list

	g.server.SendAll(packet)
}

func (g *Game) receive(client *hub.Client, data map[string]any) {
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
		g.players[client] = &Player{
			Username: username,
			Pos:      vec.Vec{X: x, Y: y},
		}
		log.Printf("Player %s joined", username)

	case "move":
		x, ok1 := data["x"].(float64)
		y, ok2 := data["y"].(float64)
		if !ok1 || !ok2 {
			log.Printf("Failed to parse join packet %v", data)
			return
		}
		g.players[client].Pos.X = x
		g.players[client].Pos.Y = y

	case "chat":
		message, ok := data["message"].(string)

		if !ok {
			log.Printf("Failed to parse message packet %v", data)
		}

		log.Printf("Player " + g.players[client].Username + " wrote: " + message)

		packet := make(map[string]any)
		packet["type"] = "message"
		packet["username"] = g.players[client].Username
		packet["message"] = message

		g.server.SendAll(packet)

	}
}

func (g *Game) sendMap() {
	data, err := json.Marshal(map[string]any{
		"type": "map",
		"map":  g.gameMap.Compress(),
	})

	if err != nil {
		log.Fatal("Failed to Marshal map")
	}

	// TODO: Send data to player (or return data)
	_ = data
}
