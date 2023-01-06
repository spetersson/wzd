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
	// Move players
	allPlayers := make([]*Player, 0)
	for _, player := range game.players {
		allPlayers = append(allPlayers, player)
		game.movePlayer(player, dt)
	}
	// Collide players with other players
	for i := 0; i < len(allPlayers); i++ {
		for j := i + 1; j < len(allPlayers); j++ {
			game.collidePlayerPlayer(allPlayers[i], allPlayers[j])
		}
	}
	// Collide players with environment
	for _, player := range game.players {
		game.collidePlayerTiles(player)
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

func (game *Game) collidePlayerTiles(player *Player) {
	// Get index range of player bounding box
	minIX := int(math.Floor(player.Pos.X - PLAYER_RAD))
	minIY := int(math.Floor(player.Pos.Y - PLAYER_RAD))

	maxIX := int(math.Floor(player.Pos.X + PLAYER_RAD))
	maxIY := int(math.Floor(player.Pos.Y + PLAYER_RAD))

	// Check all blocks in index range
	for ix := minIX; ix <= maxIX; ix++ {
		for iy := minIY; iy <= maxIY; iy++ {
			// Check if block is land
			if !game.gameMap.IsInside(ix, iy) {
				continue
			}

			tile := game.gameMap.At(ix, iy)
			var bb *BB = nil
			if !tile.Walkable() {
				// Collide with entire tile
				bb = &BB{
					Left:   float64(ix),
					Right:  float64(ix + 1),
					Top:    float64(iy),
					Bottom: float64(iy + 1),
				}
			} else if tile.Building() != nil {
				// Collide with building on tile
				diff := (1 - tile.Building().Type().Size()) * 0.5
				bb = &BB{
					Left:   float64(ix) + diff,
					Right:  float64(ix) + 1 - diff,
					Top:    float64(iy) + diff,
					Bottom: float64(iy) + 1 - diff,
				}
			} else {
				continue
			}

			collidePlayerBB(player, *bb)
		}
	}
}
