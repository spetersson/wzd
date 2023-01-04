package game

import (
	"encoding/json"
	"log"
	"time"

	"github.com/spetersson/wzd/backend/game_map"
	"github.com/spetersson/wzd/backend/vec"
)

const (
	LOOP_INTERVAL   = time.Second / 60
	UPDATE_INTERVAL = time.Second / 30
)

type Player struct {
	Username string  `json:"username"`
	Pos      vec.Vec `json:"pos"`
}

type Enemy struct {
	Id int
	X  float64
	Y  float64
}

type Game struct {
	gameMap      game_map.GameMap
	players      map[string]*Player
	enemies      map[int]*Enemy
	loopTicker   *time.Ticker
	updateTicker *time.Ticker
	done         chan bool
}

func NewGame() *Game {
	return &Game{
		gameMap:      game_map.GetMap(),
		players:      make(map[string]*Player),
		enemies:      make(map[int]*Enemy),
		loopTicker:   nil,
		updateTicker: nil,
		done:         make(chan bool),
	}
}

// Halting function that runs the game
func (g *Game) Run() {
	// Main game loop
	g.loopTicker = time.NewTicker(LOOP_INTERVAL)
	go func() {
		lastTime := time.Now().UnixMilli()
		for t := range g.loopTicker.C {
			now := t.UnixMilli()
			dt := float64(now-lastTime) / 1000.0
			g.loop(dt)
			lastTime = now
		}
	}()

	// Send updates
	g.updateTicker = time.NewTicker(UPDATE_INTERVAL)
	go func() {
		for range g.updateTicker.C {
			g.update()
		}
	}()

	<-g.done
}

func (g *Game) Stop() {
	if g.loopTicker != nil {
		g.loopTicker.Stop()
	}
	if g.updateTicker != nil {
		g.updateTicker.Stop()
	}

	g.done <- true
}

func (g *Game) update() {
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
