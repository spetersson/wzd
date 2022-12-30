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
	Nick string  `json:"nick"`
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
}

type Message struct {
	Client  Client
	message string
}

func (g *Game) Run() {
	for {
		select {
		case msg := <-g.message:
			ParseMessage(g, msg.Client, msg.message)
		}
	}
}

func ParseMessage(game *Game, client Client, message string) {

	log.Println("Incoming message: " + message)

	var data map[string]any
	json.Unmarshal([]byte(message), &data)

	switch t := data["type"]; t {

	case "join":
		game.players[client] = Player{data["nick"].(string), 0, 0}
		log.Println("Player " + data["nick"].(string) + " has joined the game.")

	case "move":
		if _, exists := game.players[client]; !exists {
			break
		}

		player := game.players[client]
		player.X = data["x"].(float64)
		player.Y = data["y"].(float64)

		log.Printf("Player %s moved to (%f, %f)", player.Nick, player.X, player.Y)

		message, _ := json.Marshal(struct {
			Type string `json:"type"`
			Player
		}{"move", player})

		client.hub.broadcast <- message
	}

}
