package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

var (
	webAddr   = flag.String("web", ":8888", "web server address")
	verbose   = flag.Bool("verbose", false, "enable verbose log")
	accessLog = flag.Bool("access", false, "enable access log")
)

type fileInfo struct {
	Name    string
	Size    int64
	Mode    os.FileMode
	ModTime time.Time
	IsDir   bool
}

func main() {
	flag.Parse()

	if *verbose {
		l = log.New(os.Stderr, "", log.Lmicroseconds)
	}

	http.HandleFunc("/gopath", func(w http.ResponseWriter, r *http.Request) {
		dir := filepath.Join(os.Getenv("GOPATH"), "src")
		if str := r.FormValue("dir"); str != "" {
			dir = filepath.Join(dir, str)
		}

		files, err := ioutil.ReadDir(dir)
		if err != nil {
			logf("ReadDir failed: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		l := []*fileInfo{}
		for _, f := range files {
			l = append(l, &fileInfo{
				Name:    f.Name(),
				Size:    f.Size(),
				Mode:    f.Mode(),
				ModTime: f.ModTime(),
				IsDir:   f.IsDir(),
			})
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
