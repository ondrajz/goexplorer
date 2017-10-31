package main

import (
	"flag"
	"log"
	"net/http"
	"os"
)

var (
	httpFlag    = flag.String("web", ":8085", "web server address")
	verboseFlag = flag.Bool("verbose", false, "enable verbose log")
	accessLog   = flag.Bool("access", false, "enable access log")
)

var l *log.Logger

func main() {
	flag.Parse()
	if *verboseFlag {
		l = log.New(os.Stderr, "", log.Lmicroseconds)
	}

	http.HandleFunc("/gopath", gopathHandler)
	http.HandleFunc("/deps", depsHandler)

	http.Handle("/static/", http.FileServer(http.Dir(".")))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if *accessLog {
			log.Printf(`- %v "%s %s"`, r.RemoteAddr, r.Method, r.URL.Path)
		}

		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		http.ServeFile(w, r, "static/index.html")
	})

	logf("serving at %v", *httpFlag)
	if err := http.ListenAndServe(*httpFlag, nil); err != nil {
		log.Fatal(err)
	}
}

func logf(f string, a ...interface{}) {
	if l != nil {
		l.Printf(f, a...)
	}
}
