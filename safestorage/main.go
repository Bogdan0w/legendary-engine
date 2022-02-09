package main

import (
	"SafeModeStorage/config"
	"SafeModeStorage/server"
	"log"
	"os"
)

func main() {
	if _, err := os.Stat("./storage"); os.IsNotExist(err) {
		errc := os.Mkdir("./storage", 0777)
		log.Fatalln(errc)
	}
	config.LoadConfig()
	server.CreateServer()
}
