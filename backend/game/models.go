package game

import (
	"github.com/spetersson/wzd/backend/game_map"
	"github.com/spetersson/wzd/backend/hub"
	m "github.com/spetersson/wzd/backend/math"
)

type Player struct {
	Username  string `json:"username"`
	Pos       m.Vec  `json:"pos"`
	Vel       m.Vec  `json:"vel"`
	Dir       m.Vec  `json:"-"`
	Sprinting bool   `json:"-"`
}

type Game struct {
	server    *hub.Hub
	timestamp int64
	gameMap   game_map.GameMap
	players   map[*hub.Client]*Player
	enemies   map[int]*Enemy
	done      chan bool
	idCounter int
}
