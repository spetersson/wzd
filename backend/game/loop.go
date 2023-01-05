package game

import (
	"math"
)

const (
	VIEW_W           = 50
	MAX_REG_SPEED    = 10
	MAX_SPRINT_SPEED = 15
	ACC              = 40
	SLOWDOWN         = 2
	PLAYER_RAD       = 0.45
	PING_INTERVAL    = 500
	NUM_PINGS_AVG    = 10
)

func (game *Game) loop(dt float64) {
	for _, player := range game.players {
		game.movePlayer(player, dt)
		game.collidePlayer(player)
	}
}

func (game *Game) movePlayer(player *Player, dt float64) {

	currentSpeed := math.Hypot(player.Vel.X, player.Vel.Y)
	if !player.Dir.IsZero() {
		// Update velocity
		player.Vel = player.Dir.Mul(currentSpeed + ACC*dt)

		// Limit speed
		var maxSpeed float64
		if player.Sprinting {
			maxSpeed = MAX_SPRINT_SPEED
		} else {
			maxSpeed = MAX_REG_SPEED
		}
		if currentSpeed > maxSpeed {
			ratio := maxSpeed / currentSpeed
			player.Vel.IMul(ratio)
		}
	} else if !player.Vel.IsZero() {
		// No input, slow down player
		newSpeed := math.Max(0, currentSpeed-ACC*SLOWDOWN*dt)
		ratio := newSpeed / currentSpeed
		player.Vel.IMul(ratio)
	}

	// Check if player is moving
	if !player.Vel.IsZero() {
		player.Pos.IAdd(player.Vel.Mul(dt))
	}

}

func (game *Game) collidePlayer(player *Player) {

}
