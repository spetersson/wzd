package game

func (game *Game) loop(dt float64) {
	for _, player := range game.players {
		game.movePlayer(player)
		game.collidePlayer(player)
	}
}

func (game *Game) movePlayer(player *Player) {}

func (game *Game) collidePlayer(player *Player) {}
