package main

import (
	// "flag"
	"fmt"
	"log"
	"net/http"

	"github.com/spetersson/wzd/backend/server"
)

func serveHome(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	if r.URL.Path != "/" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	http.ServeFile(w, r, "home.html")
}

func main() {

	game := server.NewGame()
	go game.Run()

	hub := server.NewHub(*game)
	go hub.Run()

	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		server.ServeWs(hub, w, r)
	})
	host := "0.0.0.0:7070"
	fmt.Printf("Starting server on '%s'\n", host)
	err := http.ListenAndServe(host, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
