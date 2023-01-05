package game

import (
	"log"
	"time"

	"github.com/spetersson/wzd/backend/game_map"
	"github.com/spetersson/wzd/backend/hub"
)

const (
	LOOP_INTERVAL   = time.Second / 60
	UPDATE_INTERVAL = time.Second / 30
)

type dict = map[string]any

func NewGame(server *hub.Hub) *Game {
	return &Game{
		server:    server,
		timestamp: 0,
		gameMap:   game_map.GetMap(),
		players:   make(map[*hub.Client]*Player),
		enemies:   make(map[int]*Enemy),
		done:      make(chan bool),
	}
}

// Halting function that runs the game
func (game *Game) Run() {
	// Main game loop
	loopTicker := time.NewTicker(LOOP_INTERVAL)
	game.timestamp = time.Now().UnixMilli()
	for {
		select {
		case <-loopTicker.C:
			now := time.Now().UnixMilli()
			dt := float64(now-game.timestamp) / 1000.0
			game.loop(dt)
			game.update()
			game.timestamp = now

		case packet := <-game.server.Receiver():
			game.receive(packet.Client, packet.Data)

		case client := <-game.server.Unregister():
			if player, ok := game.players[client]; ok {
				log.Printf("Player %s left", player.Username)
			}
			delete(game.players, client)
		}
	}
}
