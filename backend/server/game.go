package server

import "log"
import "encoding/json"

type Game struct {
	players map[Client]Player
	message chan *Message
}

func NewGame() *Game {
	return &Game{
		players: make(map[Client]Player),
		message: make(chan *Message),
	}
}

type Player struct {
	Nick string
}

type Message struct {
	Client  Client
	message string
}

// var leaving = make(chan message)
// var messages = make(chan Message)

func (g *Game) Run() {
	for {
		select {
		case msg := <-g.message:
			ParseMessage(msg.Client, msg.message)
		}
	}
}

func ParseMessage(client Client, message string) {

	log.Println("Incoming message: " + message)

	var data map[string]any
	json.Unmarshal([]byte(message), &data)

	switch t := data["type"]; t {

	case "join":
		// client.Nick = data["nick"].(string)
		log.Println("Player " + data["nick"].(string) + " has joined the game.")

	case "move":
		log.Println("Move command")
	}

}
