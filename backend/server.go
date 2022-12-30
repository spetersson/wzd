// package main
//
// import (
// 	"bufio"
// 	"encoding/json"
// 	"fmt"
// 	"log"
// 	"net"
// )
//
// var clients = make(map[string]client)
// var leaving = make(chan message)
// var messages = make(chan message)
//
// type client struct {
// 	Conn net.Conn
// 	Nick string
// }
//
// type message struct {
// 	text    string
// 	address string
// }
//
// func main() {
// 	listen, err := net.Listen("tcp", "0.0.0.0:9090")
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	go broadcaster()
// 	for {
// 		conn, err := listen.Accept()
// 		if err != nil {
// 			log.Print(err)
// 			continue
// 		}
// 		go handle(conn)
// 	}
// }
//
// func handle(conn net.Conn) {
// 	clients[conn.RemoteAddr().String()] = client{conn, "anonymous"}
//
// 	messages <- newMessage(" joined.", conn)
//
// 	input := bufio.NewScanner(conn)
// 	for input.Scan() {
// 		messages <- newMessage(input.Text(), conn)
// 	}
//
// 	//Delete client form map
// 	delete(clients, conn.RemoteAddr().String())
//
// 	leaving <- newMessage(" has left.", conn)
//
// 	conn.Close() // NOTE: ignoring network errors
// }
//
// func newMessage(msg string, conn net.Conn) message {
// 	addr := conn.RemoteAddr().String()
// 	return message{
// 		text:    msg,
// 		address: addr,
// 	}
// }
//
// func broadcaster() {
// 	for {
// 		select {
// 		case msg := <-messages:
// 			for _, client := range clients {
// 				if msg.address == client.Conn.RemoteAddr().String() {
// 					continue
// 				}
// 				parseMessage(client, msg.text)
// 				// fmt.Fprintln(conn, msg.text) // NOTE: ignoring network errors
// 			}
// 		case msg := <-leaving:
// 			for _, client := range clients {
// 				fmt.Fprintln(client.Conn, msg.text) // NOTE: ignoring network errors
// 			}
// 		}
// 	}
// }
//
// func parseMessage(client client, message string) {
//
// 	fmt.Println("Incoming message: " + message)
//
// 	var data map[string]any
// 	json.Unmarshal([]byte(message), &data)
//
// 	switch t := data["type"]; t {
//
// 	case "join":
// 		client.Nick = data["nick"].(string)
// 		fmt.Println("Player " + data["nick"].(string) + " has joined the game.")
//
// 	case "move":
// 		fmt.Println("Move command")
// 	}
//
// }
