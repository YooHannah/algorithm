package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer ws.Close()

	fmt.Println("连接成功")

	for {
		messageType, message, err := ws.ReadMessage()
		fmt.Printf("Received message: %s, messageType: %d, err: %v\n", message, messageType, err)
		if err != nil {
			fmt.Println("Error reading message:", err)
			return // 直接跳出整个函数
		}
		if string(message) == "quit" {
			break
		}
		msg := append(message, "已收到"...)
		err = ws.WriteMessage(messageType, msg)
		if err != nil {
			fmt.Println("Error writing message:", err)
			break // 直接跳出循环， 下面还会打印
		}
	}
	fmt.Println("Websocket 连接已关闭")
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	fmt.Println("服务器已启动，监听端口 8080")
	http.ListenAndServe(":8080", nil)
}
