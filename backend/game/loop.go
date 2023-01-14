package game

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
		movePlayer(player, dt)
	}
	// Collide players with other players
	for i := 0; i < len(allPlayers); i++ {
		for j := i + 1; j < len(allPlayers); j++ {
			game.collidePlayerPlayer(&allPlayers[i].Body, &allPlayers[j].Body)
		}
	}
	// Collide players with environment
	for _, player := range game.players {
		game.collideBodyTiles(&player.Body)
	}

	game.spawnEnemies(dt)
}
