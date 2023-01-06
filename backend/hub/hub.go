package hub

import (
	"fmt"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

const (
	HOST = "0.0.0.0:7070"
)

type Packet struct {
	Client *Client
	Data   map[string]any
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	receiver   chan *Packet
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
		receiver:   make(chan *Packet),
	}
}

func (hub *Hub) Run() {
	go func() {
		for {
			select {
			case client := <-hub.register:
				hub.clients[client] = true
			case client := <-hub.unregister:
				if _, ok := hub.clients[client]; ok {
					delete(hub.clients, client)
					close(client.send)
				}
			case message := <-hub.broadcast:
				for client := range hub.clients {
					select {
					case client.send <- message:
					default:
						close(client.send)
						delete(hub.clients, client)
					}
				}
			}
		}
	}()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})
	fmt.Printf("Starting server on '%s'\n", HOST)
	err := http.ListenAndServe(HOST, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func (hub *Hub) Unregister() chan *Client {
	return hub.unregister
}

func (hub *Hub) Receiver() chan *Packet {
	return hub.receiver
}

func (hub *Hub) SendAll(packet bson.M) {
	data, err := bson.Marshal(packet)
	if err != nil {
		log.Printf("Unable to marshal packet: %v", packet)
		return
	}

	hub.broadcast <- data
}

func (hub *Hub) SendTo(client *Client, packet bson.M) {
	data, err := bson.Marshal(packet)
	if err != nil {
		log.Printf("Unable to marshal packet: %v", packet)
		return
	}

	client.send <- data
}
