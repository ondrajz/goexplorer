package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
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

	http.HandleFunc("/gopath", func(w http.ResponseWriter, r *http.Request) {
		l := []string{}

		files, err := ioutil.ReadDir(filepath.Join(os.Getenv("GOPATH"), "src"))
		if err != nil {
			logf("ReadDir failed: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for _, file := range files {
			l = append(l, file.Name())
		}

		b, err := json.MarshalIndent(l, "", "  ")
		if err != nil {
			logf("MarshalIndent failed: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "text/json")
		w.Write(b)
	})
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
