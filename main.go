package main

import (
	"bytes"
	"fmt"
	"syscall/js"

	"github.com/traefik/yaegi/interp"
	"github.com/traefik/yaegi/stdlib"
)

func runGoCode(this js.Value, args []js.Value) interface{} {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in runGoCode:", r)
		}
	}()

	code := args[0].String()
	input := args[1].String()
	inputReader := bytes.NewReader([]byte(input))

	var out bytes.Buffer
	// var err bytes.Buffer

	i := interp.New(interp.Options{
		Stdin:                inputReader,
		Stdout:               &out,
		Unrestricted:         false,
	})
	i.Use(stdlib.Symbols)


	if _, err := i.Eval(code); err != nil {
		return fmt.Sprintf("Error: %v", err)
	}


	return out.String()
}

func main() {
	js.Global().Set("runGoCode", js.FuncOf(runGoCode))
	select {}
}
