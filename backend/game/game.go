package game

import (
	"encoding/json"
	"log"
	"time"

	"github.com/spetersson/wzd/backend/game_map"
	"github.com/spetersson/wzd/backend/hub"
)

const (
	LOOP_INTERVAL   = time.Second / 60
	UPDATE_INTERVAL = time.Second / 30
)

func NewGame(server *hub.Hub) *Game {
	return &Game{
		server:  server,
		gameMap: game_map.GetMap(),
		players: make(map[string]*Player),
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
			g.receive(packet)
		}
	}
}

func (g *Game) update() {
}

func (g *Game) receive(packet map[string]any) {
	log.Print(packet)
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
