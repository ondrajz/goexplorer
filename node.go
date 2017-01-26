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
	Func              = "func"
)

type node struct {
	Type NodeType
	Loc  string `json:",omitempty"`
	Dir  string `json:",omitempty"`

	Id    string `json:"Id"`
	Label string `json:"Label"`
	Value int64  `json:"Value,omitempty"`

	//Nodes []*node `json:"nodes,omitempty"`
}

type edge struct {
	From string
	To   string
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

func depsHandler(w http.ResponseWriter, r *http.Request) {
	gopath := os.Getenv("GOPATH")
	dirSrc := filepath.Join(gopath, "src")
	impPath := "github.com/TrueFurby/go-callvis"

	logf("deps for: %s", impPath)

	pathMap := make(map[string]bool)
	var addPkg func(path string)

	/*impPkg, err := build.Import(impPath, dirSrc, 0)
	if err != nil {
		logf("build.Import %s failed: %v", path, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}*/
	nodes := []*node{}
	edges := []*edge{}

	addPkg = func(path string) {
		pkg, err := build.Import(path, dirSrc, 0)
		if err != nil {
			logf("build.Import %s failed: %v", path, err)
			return
		} else if pkg.Goroot {
			return
		}
		if _, ok := pathMap[path]; !ok {
			logf("addPkg %s", path)
			pathMap[path] = true
			var typ NodeType = Package
			if pkg.IsCommand() {
				typ = Program
			}
			nodes = append(nodes, &node{
				Id:    pkg.ImportPath,
				Label: pkg.Name,
				Type:  typ,
				//Nodes: nodes,
			})
		}
		for _, p := range pkg.Imports {
			addPkg(p)
			edges = append(edges, &edge{
				From: pkg.ImportPath, To: p,
			})
		}
	}
	addPkg(impPath)
	/*&node{
			Id:    pkg.ImportPath,
			Label: pkg.Name,
			Type:  Package,
			Nodes: addPkg(impPath)
	    }*/
	var data = struct {
		Nodes []*node
		Edges []*edge
	}{nodes, edges}

	b, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		logf("MarshalIndent failed: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/json")
	w.Write(b)
}
