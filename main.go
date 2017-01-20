package main

import (
	"flag"
	"log"
	"net/http"
	"os"
)

var (
	webAddr   = flag.String("web", ":8888", "web server address")
	verbose   = flag.Bool("verbose", false, "enable verbose log")
	accessLog = flag.Bool("access", false, "enable access log")
)

func main() {
	flag.Parse()

	if *verbose {
		l = log.New(os.Stderr, "", log.Lmicroseconds)
	}

	http.HandleFunc("/gopath", gopathHandler)

	http.Handle("/static/", http.FileServer(http.Dir(".")))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if *accessLog {
			log.Printf(`- %v "%s %s"`, r.RemoteAddr, r.Method, r.URL.Path)
		}

		if r.URL.Path == "/" {
			http.ServeFile(w, r, "static/index.html")
			return
		}

		http.NotFound(w, r)
	})

	logf("serving at %s", *webAddr)
	if err := http.ListenAndServe(*webAddr, nil); err != nil {
		log.Fatal(err)
	}
}

var l *log.Logger

func logf(f string, a ...interface{}) {
	if l != nil {
		l.Printf(f, a...)
	}
}
