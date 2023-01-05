package game

import (
	"github.com/spetersson/wzd/backend/game_map"
	"github.com/spetersson/wzd/backend/hub"
	"github.com/spetersson/wzd/backend/vec"
)

type Player struct {
	Username  string  `json:"username"`
	Pos       vec.Vec `json:"pos"`
	Vel       vec.Vec `json:"vel"`
	Dir       vec.Vec `json:"-"`
	Sprinting bool    `json:"-"`
}

type Enemy struct {
	Id int
	X  float64
	Y  float64
}

type Game struct {
	server    *hub.Hub
	timestamp int64
	gameMap   game_map.GameMap
	players   map[*hub.Client]*Player
	enemies   map[int]*Enemy
	done      chan bool
}
