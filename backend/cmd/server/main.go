package main

import (
	"fmt"
	"os"
)

func main() {
	var myName string = os.Getenv("MY_NAME")
	fmt.Printf("Hello World. Welcome %s!\n", myName)
}
