package hub

import (
	"fmt"
	"log"
	"net/http"
)

const (
	HOST = "0.0.0.0:7070"
)

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	receiver   chan map[string]any
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	go func() {
		for {
			select {
			case client := <-h.register:
				h.clients[client] = true
			case client := <-h.unregister:
				if _, ok := h.clients[client]; ok {
					delete(h.clients, client)
					close(client.send)
				}
			case message := <-h.broadcast:
				for client := range h.clients {
					select {
					case client.send <- message:
					default:
						close(client.send)
						delete(h.clients, client)
					}
				}
			}
		}
	}()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(h, w, r)
	})
	fmt.Printf("Starting server on '%s'\n", HOST)
	err := http.ListenAndServe(HOST, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func (h *Hub) Receiver() chan map[string]any {
	return h.receiver
}

func (h *Hub) SendAll(packet map[string]any) {
	// TODO Send packet to all clients
}

func (h *Hub) SendTo(client string, packet map[string]any) {

}
