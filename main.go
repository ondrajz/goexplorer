package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"time"
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
	http.HandleFunc("/deps", depsHandler)

	http.Handle("/static/", http.FileServer(http.Dir(".")))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "static/index.html")
			return
		}
		http.NotFound(w, r)
	})

	logf("serving at %s", *webAddr)
	if err := http.ListenAndServe(*webAddr, logHandler(http.DefaultServeMux)); err != nil {
		log.Fatal(err)
	}
}

func logHandler(h http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		t0 := time.Now()
		h.ServeHTTP(w, r)
		if *accessLog {
			log.Printf(`- %v %v "%s %s"`, r.RemoteAddr, time.Since(t0), r.Method, r.URL.Path)
		}
	}
}

var l *log.Logger

func logf(f string, a ...interface{}) {
	if l != nil {
		l.Printf(f, a...)
	}
}
