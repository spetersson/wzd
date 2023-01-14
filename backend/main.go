package main

import (
	"log"
	"os"
	"os/signal"

	"github.com/spetersson/wzd/backend/game"
	"github.com/spetersson/wzd/backend/hub"
)

func main() {
	hub := hub.NewHub()
	go hub.Run()

	game := game.NewGame(hub)
	go game.Run()

	done := make(chan bool)
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		for range c {
			log.Println("Got interrupt")
			gameStopped := game.Stop()
			<-gameStopped
			done <- true

			hubStopped := hub.Stop()
			<-hubStopped
			done <- true
		}
	}()

	<-done
}
