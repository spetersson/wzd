package main

import (
	"github.com/spetersson/wzd/backend/game"
	"github.com/spetersson/wzd/backend/hub"
)

func main() {
	hub := hub.NewHub()
	go hub.Run()

	game := game.NewGame(hub)
	go game.Run()

	select {}
}
