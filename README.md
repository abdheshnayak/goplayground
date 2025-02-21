# Go Playground in Browser

This project enables you to run Go code directly in your browser. It leverages [Yaegi](https://github.com/traefik/yaegi), an interpreter for Go, combined with WebAssembly (WASM) to transpile and execute Go code in the browser.

## Features

- **Run Go code in the browser:** Write and execute Go code directly in the browser without needing a Go environment.
- **Interactive Go Playground:** Allows for live coding and experimenting with Go code in real-time.
- **Yaegi Interpreter:** Uses [Yaegi](https://github.com/traefik/yaegi) to interpret Go code and convert it to WebAssembly.
- **Fast and Lightweight:** The use of WASM makes it lightweight and fast to execute code directly in your browser.

## Technologies Used

- **Go** - The primary programming language for writing code.
- **Yaegi** - A Go interpreter that dynamically evaluates Go code.
- **WebAssembly (WASM)** - A binary instruction format for safe and efficient execution on the web.
- **HTML/CSS** - For building the user interface.
- **JavaScript** - To interact with the WASM module and dynamically load Go code into the browser.

## Installation

### Prerequisites

To run this project locally, you need:

- A modern browser (Chrome, Firefox, or Edge)
- Node.js (optional, if you want to build from source)

### Clone the Repository

```bash
git clone https://github.com/abdheshnayak/goplayground.git
cd goplayground
```

### Running the Project

1. Open `index.html` in your browser directly, or
2. If you want to run the project locally with a local server:
   - Use a simple server (e.g., Python's built-in HTTP server):
   ```bash
   python3 -m http.server 8000
   ```
   - Navigate to `http://localhost:8000` in your browser.

### Using the Go Playground

- **Write Go Code:** Enter Go code in the input box.
- **Execute Code:** Click on the **Run** button to execute the Go code.
- **See Output:** The output of your Go code will be displayed in the output box below the editor.

## How It Works

1. **Yaegi Interpreter Embedded into WASM:** The Yaegi interpreter is pre-compiled and embedded into WebAssembly (WASM). This means that the interpretation logic is already included in the WASM module, allowing Go code to be interpreted and executed directly in the browser without needing a server-side Go environment.
   
2. **Execution in the Browser:** When you run Go code, it is passed to the embedded Yaegi interpreter within the WASM module. The WASM module then dynamically interprets and executes the Go code in the browser.
   
3. **Real-time Output:** The results of the executed Go code are displayed in the browser, making it possible to see the output instantly without leaving the browser environment.

## Example

Here is an example Go code that you can try in the playground:

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go Playground in Browser!")
}
```

Simply paste it into the editor and click **Run** to see the output in your browser.

## Contributing

We welcome contributions to improve this project. You can help by:

- Reporting bugs
- Suggesting features
- Submitting pull requests for enhancements

### How to Contribute

1. Fork the repository.
2. Create a new branch for your changes (`git checkout -b feature-xyz`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-xyz`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
