package server

import (
	"encoding/json"
	"log"
	"time"
)

type Game struct {
	players map[Client]*Player
	message chan *Message
}

func NewGame() *Game {
	return &Game{
		players: make(map[Client]*Player),
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

	ticker := time.NewTicker(time.Second / 30)
	go func() {
		for {
			select {
			case <-ticker.C:

				if len(g.players) == 0 {
					continue
				}

				data := make(map[string]any)
				list := make([]map[string]any, 0)
				for _, p := range g.players {
					playerData := make(map[string]any)
					playerData["nick"] = p.Nick
					playerData["x"] = p.X
					playerData["y"] = p.Y
					list = append(list, playerData)
				}
				data["type"] = "update"
				data["players"] = list

				message, _ := json.Marshal(data)

				for c, _ := range g.players {
					c.hub.broadcast <- message
					break
				}
			}
		}
	}()
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
		game.players[client] = &Player{data["nick"].(string), 0, 0}
		log.Println("Player " + data["nick"].(string) + " has joined the game.")

	case "move":
		if _, exists := game.players[client]; !exists {
			break
		}

		player := game.players[client]
		player.X = data["x"].(float64)
		player.Y = data["y"].(float64)

		log.Printf("Player %s moved to (%f, %f)", player.Nick, player.X, player.Y)
	}

}
