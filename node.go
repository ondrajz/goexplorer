package main

import (
	"encoding/json"
	"fmt"
	"go/build"
	"go/parser"
	"go/token"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type NodeType string

const (
	_        NodeType = "(unknown)"
	TopLevel          = "topLevel"
	Folder            = "folder"
	File              = "file"
	Source            = "source"
	Package           = "package"
	Program           = "program"
	Object            = "object"
)

type node struct {
	Type NodeType
	Loc  string
	Dir  string

	Id    string
	Label string
	Value int64
}

func gopathHandler(w http.ResponseWriter, r *http.Request) {
	gopath := os.Getenv("GOPATH")
	dirSrc := filepath.Join(gopath, "src")

	dir := dirSrc
	if str := r.FormValue("dir"); str != "" {
		dir = filepath.Join(dir, str)
	}

	nodes := []*node{}
	if file, err := os.Stat(dir); err != nil {
		logf("Stat for %q failed: %v", dir, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if !file.IsDir() && filepath.Ext(file.Name()) == ".go" {
		fset := token.NewFileSet()
		af, err := parser.ParseFile(fset, dir, nil, 0)
		if err != nil {
			logf("ParseFile for %q failed: %v", dir, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for _, v := range af.Scope.Objects {
			nodes = append(nodes, &node{
				Id:    fmt.Sprint(v.Pos()),
				Label: fmt.Sprintf("<code>%s</code>\n%s", v.Kind, v.Name),
				Type:  Object,
				Dir:   dir,
			})
		}
	} else {
		files, err := ioutil.ReadDir(dir)
		if err != nil {
			logf("ReadDir for %q failed: %v", dir, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		} else {
			for _, f := range files {
				base := filepath.Base(f.Name())
				// omit hidden files
				if strings.HasPrefix(base, ".") {
					continue
				}

				path := filepath.Join(dir, f.Name())
				// omit non .go files
				if !f.IsDir() && filepath.Ext(path) != ".go" {
					continue
				}

				loc, _ := filepath.Rel(dirSrc, path)

				var typ NodeType
				if dir == dirSrc {
					typ = TopLevel
				} else if f.IsDir() {
					typ = Folder
					if pkg, err := build.Import(loc, "", 0); err == nil {
						if pkg.Name == "main" {
							typ = Program
						} else {
							typ = Package
						}
					}
				} else {
					typ = Source
				}

				nodes = append(nodes, &node{
					Id:    path,
					Label: f.Name(),
					Value: f.Size(),
					Loc:   loc,
					Dir:   dir,
					Type:  typ,
				})
			}
		}
	}

	b, err := json.MarshalIndent(nodes, "", "  ")
	if err != nil {
		logf("MarshalIndent failed: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/json")
	w.Write(b)
}
