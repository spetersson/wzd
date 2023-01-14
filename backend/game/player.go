package game

import (
	"math"

	m "github.com/spetersson/wzd/backend/math"
	phy "github.com/spetersson/wzd/backend/physics"
)

type Player struct {
	Username  string
	Dir       m.Vec
	Sprinting bool
	Body      phy.BodyCircle
}

func movePlayer(player *Player, dt float64) {

	currentSpeed := math.Hypot(player.Body.Vel().X, player.Body.Vel().Y)
	if !player.Dir.IsZero() {
		// Update velocity
		player.Body.Vel().SetV(player.Dir.Mul(currentSpeed + ACC*dt))

		// Limit speed
		var maxSpeed float64
		if player.Sprinting {
			maxSpeed = MAX_SPRINT_SPEED
		} else {
			maxSpeed = MAX_REG_SPEED
		}
		if currentSpeed > maxSpeed {
			ratio := maxSpeed / currentSpeed
			player.Body.Vel().IMul(ratio)
		}
	} else if !player.Body.Vel().IsZero() {
		// No input, slow down player
		newSpeed := math.Max(0, currentSpeed-ACC*SLOWDOWN*dt)
		ratio := newSpeed / currentSpeed
		player.Body.Vel().IMul(ratio)
	}

	// Check if player is moving
	if !player.Body.Vel().IsZero() {
		player.Body.Move(player.Body.Vel().Mul(dt))
	}

}
