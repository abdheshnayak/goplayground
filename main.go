package main

import (
	"bytes"
	"fmt"
	"io"
	"syscall/js"

	"github.com/traefik/yaegi/interp"
	"github.com/traefik/yaegi/stdlib"
)

// stdoutCallbackWriter calls a JS function with each Write, for streaming stdout.
type stdoutCallbackWriter struct {
	callback js.Value
}

func (w *stdoutCallbackWriter) Write(p []byte) (n int, err error) {
	if len(p) == 0 {
		return 0, nil
	}
	if w.callback.Type() == js.TypeFunction {
		w.callback.Invoke(string(p))
	}
	return len(p), nil
}

func runGoCode(this js.Value, args []js.Value) interface{} {
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered in runGoCode: %v\n", r)
		}
	}()

	if len(args) < 2 {
		return "Error: runGoCode requires code and input"
	}
	code := args[0].String()
	input := args[1].String()
	inputReader := bytes.NewReader([]byte(input))

	var stdout io.Writer
	if len(args) >= 3 && args[2].Type() == js.TypeFunction {
		stdout = &stdoutCallbackWriter{callback: args[2]}
	} else {
		var buf bytes.Buffer
		stdout = &buf
	}

	i := interp.New(interp.Options{
		Stdin:        inputReader,
		Stdout:       stdout,
		Unrestricted: false,
	})
	i.Use(stdlib.Symbols)

	if _, err := i.Eval(code); err != nil {
		return fmt.Sprintf("Error: %v", err)
	}

	// When using callback, success returns empty; otherwise return buffered output
	if b, ok := stdout.(*bytes.Buffer); ok {
		return b.String()
	}
	return ""
}

func main() {
	js.Global().Set("runGoCode", js.FuncOf(runGoCode))
	select {}
}
