---
title: Go notes
description: here is some Go lang notes i have taken while learning the language.
date: 2025-05-01
---

## Go fundamentals
```go
package main

import (
    "fmt"
    "strings"
)

// 1. Basic Data Types
func dataTypes() {
    // Primitive Types
    var integer int = 42             // Integer
    var floatNum float64 = 3.14       // Floating point
    var boolean bool = true           // Boolean
    var character rune = 'A'          // Single character
    var text string = "Hello, Go!"    // String

    // Complex Types
    var arr [5]int = [5]int{1, 2, 3, 4, 5}          // Fixed-size array
    slice := []int{1, 2, 3, 4, 5}                   // Dynamic slice
    mapping := map[string]int{"apple": 5, "banana": 3}  // Map (dictionary)

    fmt.Println(integer, floatNum, boolean, character, text, arr, slice, mapping)
}

// 2. Pointers and Memory Management
func pointersAndMemory() {
    x := 10
    ptr := &x       // Pointer to x
    *ptr = 20       // Dereferencing and modifying value

    // Struct with pointer receiver
    type Rectangle struct {
        width, height int
    }

    // Pointer receiver method
    func (r *Rectangle) scale(factor int) {
        r.width *= factor
        r.height *= factor
    }
}

// 3. Structs and Methods
type Person struct {
    Name string
    Age  int
}

// Method with value receiver
func (p Person) Introduce() string {
    return fmt.Sprintf("Hi, I'm %s, %d years old", p.Name, p.Age)
}

// 4. Interfaces
type Stringer interface {
    String() string
}

func (p Person) String() string {
    return p.Introduce()
}

// 5. Error Handling
func divideNumbers(a, b int) (int, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

// 6. Concurrency (Goroutines and Channels)
func concurrencyExample() {
    // Goroutine
    go func() {
        fmt.Println("Running in background")
    }()

    // Channel for communication
    ch := make(chan int)

    go func() {
        ch <- 42  // Send value to channel
    }()

    value := <-ch  // Receive value from channel
    fmt.Println(value)
}

// 7. Defer, Panic, and Recover
func deferAndRecover() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from:", r)
        }
    }()

    panic("something went wrong")
}

// 8. Generics (Go 1.18+)
func printAnything[T any](value T) {
    fmt.Println(value)
}

// 9. Higher-Order Functions
func multiplier(factor int) func(int) int {
    return func(x int) int {
        return x * factor
    }
}

func main() {
    // Examples of usage
    person := Person{Name: "Alice", Age: 30}
    fmt.Println(person.Introduce())

    // Error handling
    result, err := divideNumbers(10, 2)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Result:", result)
    }

    // Generics
    printAnything(42)
    printAnything("Hello")

    // Higher-order function
    double := multiplier(2)
    fmt.Println(double(5))  // Outputs: 10
}
```
### byte slice
In Go, a **byte slice** is a type of slice that contains a sequence of bytes (8-bit values). It's commonly used for handling binary data, strings, and network communication, as most of these are represented as a series of bytes.
```go
data := []byte{'H', 'e', 'l', 'l', 'o'}
fmt.Println(data) // Output: [72 101 108 108 111]
buf := make([]byte, 1024) // Create a buffer (byte slice) of size 1024
```
A **byte slice** (`[]byte`) in Go is a dynamic array of bytes and is the standard way to handle raw binary data (such as network data, file contents, etc.). In your code
### defer
In Go, `defer` is a keyword that is used to schedule a function call to be executed **after the surrounding function completes**. The function that is deferred will not run until the surrounding function returns, even if there are multiple return points in the function.
#### **How does `defer` work?**

- **Deferring a function** means that the function will execute **last**, right before the surrounding function returns.
- It’s useful for cleanup tasks, like closing files, network connections, or releasing resources, because it ensures that the task will be done even if the function exits early due to an error or other conditions.
#### **Why is `defer` useful in this context?**

1. **Clean-up**: The `defer conn.Close()` ensures that the network connection (`conn`) is closed when you're done with it, even if an error occurs or the function returns early.
2. **Readability**: It makes your code easier to read and maintain because the cleanup (in this case, closing the connection) is placed right next to the code that opens the resource, making it clear that the connection will be closed at the end of the function.
## net package

The Dial function connects to a server:
```go
conn, err := net.Dial("tcp", "golang.org:80")
if err != nil {
	// handle error
}
fmt.Fprintf(conn, "GET / HTTP/1.0\r\n\r\n")
status, err := bufio.NewReader(conn).ReadString('\n')
// ...
```
The Listen function creates servers:
```go
ln, err := net.Listen("tcp", ":8080")
if err != nil {
	// handle error
}
for {
	conn, err := ln.Accept()
	if err != nil {
		// handle error
	}
	go handleConnection(conn)
}
```

 it waits for the next call and returns a generic [[Conn]].
```go
func(l *TCPlistener) Accept() (Conn, error)
```

example of building simple HTTP server using raw TCP:
we specify server struct first its type is [[listener]].
we start the server by listen and handle error then :
`s.listener = l` is setting up the `Server` to manage the listener (`l`) for the rest of its lifecycle. Without this line, the server wouldn’t have a reference to the listener and couldn’t accept any connections.
you notice that we abstract listen accept and close functions to be easily used later.
accept function return [[Conn]]
```go
package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strings"
)

func main() {
	// You can use print statements as follows for debugging, they'll be visible when running tests.
	fmt.Println("Logs from your program will appear here!")
	s := Server{}
	s.Start()

}

type Server struct {
	listener net.Listener
}

func (s *Server) Start() {
	s.Listen()
	defer s.Close()

	for {
		conn := s.Accept()
		fmt.Println("Accepted connection from: ", conn.RemoteAddr())
		go s.handleConnection(conn)
	}

}
func (s *Server) Listen() {

	l, err := net.Listen("tcp", "0.0.0.0:4221")
	if err != nil {
		fmt.Println("Failed to bind to port 4221")
		os.Exit(1)
	}
	s.listener = l
}

func (s *Server) Accept() net.Conn {
	conn, err := s.listener.Accept()
	if err != nil {
		fmt.Println("Error accepting connection: ", err.Error())
		os.Exit(1)
	}
	return conn
}
func (s *Server) Close() {
	err := s.listener.Close()
	if err != nil {
		fmt.Println("Failed to close listener:", err.Error())
	}
}
func (s *Server) handleConnection(conn net.Conn) {
	defer conn.Close()
	reader := bufio.NewReader(conn)
	line, err := reader.ReadString('\n')
	if err != nil {
		fmt.Println("Error reading request:", err)
		conn.Close()
		return
	}
	parts := strings.Split(line, " ")
	path := parts[1]
	if len(parts) < 2 {
		conn.Write([]byte("HTTP/1.1 400 Bad Request\r\n\r\n"))
		conn.Close()
		return
	}

	switch path {
	case "/":
		fmt.Println(parts)
		conn.Write([]byte("HTTP/1.1 200 OK\r\n\r\nWelcome!\n"))
	case "/hello":
		conn.Write([]byte("HTTP/1.1 200 OK\r\n\r\nHello, World!\n"))
	default:
		conn.Write([]byte("HTTP/1.1 404 Not Found\r\n\r\n"))
	}
}
```
## performing terminal commands
---
```go
cmd := exec.Command("command", "arg1","arg2", "arg3", .....)
processBytes, err := cmd.Output() //this for getting the output
if err != nil {
	//handling error
}
```
## working with PDF.
> You can use libraries like:
- [`unidoc/unipdf`](https://github.com/unidoc/unipdf) (commercial but free for non-commercial use)
- [`pdfcpu`](https://github.com/pdfcpu/pdfcpu) (open-source, good for text and metadata)
- [`rsc.io/pdf`](https://github.com/rsc/pdf) (read-only, not well maintained)
> simple example using `pdfcpu`
```go
package main

import (
	"fmt"
	"io/ioutil"
	"log"

	"github.com/pdfcpu/pdfcpu/pkg/api"
)

func main() {
	content, err := api.ExtractPlainTextFile("exam_tables.pdf", nil, nil)
	if err != nil {
		log.Fatal(err)
	}

	data, err := ioutil.ReadFile(content[0])
	if err != nil {
		log.Fatal(err)
	}

	text := string(data)
	fmt.Println(text) // you can filter lines with "502" here
}
```

this how to use go copy function
``` go
func copy(dst, src []Type) int
```
