package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net"
)

var clients = make(map[string]net.Conn)
var leaving = make(chan message)
var messages = make(chan message)

type message struct {
	text    string
	address string
}

func main() {
	listen, err := net.Listen("tcp", "localhost:9090")
	if err != nil {
		log.Fatal(err)
	}
	go broadcaster()
	for {
		conn, err := listen.Accept()
		if err != nil {
			log.Print(err)
			continue
		}
		go handle(conn)
	}
}

func handle(conn net.Conn) {
	clients[conn.RemoteAddr().String()] = conn

	messages <- newMessage(" joined.", conn)

	input := bufio.NewScanner(conn)
	for input.Scan() {
		messages <- newMessage(input.Text(), conn)
	}

	//Delete client form map
	delete(clients, conn.RemoteAddr().String())

	leaving <- newMessage(" has left.", conn)

	conn.Close() // NOTE: ignoring network errors
}

func newMessage(msg string, conn net.Conn) message {
	addr := conn.RemoteAddr().String()
	return message{
		text:    msg,
		address: addr,
	}
}

func broadcaster() {
	for {
		select {
		case msg := <-messages:
			for _, conn := range clients {
				if msg.address == conn.RemoteAddr().String() {
					continue
				}
				parseMessage(msg.text)
				// fmt.Fprintln(conn, msg.text) // NOTE: ignoring network errors
			}
		case msg := <-leaving:
			for _, conn := range clients {
				fmt.Fprintln(conn, msg.text) // NOTE: ignoring network errors
			}
		}
	}
}

func parseMessage(message string) {

	fmt.Println(message)

	var data map[string]any
	json.Unmarshal([]byte(message), &data)

	switch t := data["type"]; t {

	case "move":
		fmt.Println("Move command")

	case "join":
		fmt.Println("Player " + data["nick"].(string) + " has joined the game.")
	}

}
