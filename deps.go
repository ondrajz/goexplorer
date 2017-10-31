package main

import (
	"go/build"
	"strings"
)

type pkgDep struct {
	Name     string
	Import   string
	Dir      string
	IsStd    bool
	IsVendor bool
}

func GetDeps(thePkg string, noStd bool) ([]*pkgDep, error) {
	logf("GetDeps %v %v", thePkg, noStd)

	pkg, err := build.Import(thePkg, "", 0)
	if err != nil {
		logf("build.Import failed: %v", err)
		return nil, err
	}

	deps := []*pkgDep{}
	for _, p := range pkg.Imports {
		if dep, err := build.Import(p, "", 0); err == nil {
			if !dep.Goroot || !noStd {
				deps = append(deps, &pkgDep{
					Name:     dep.Name,
					Import:   dep.ImportPath,
					IsStd:    dep.Goroot,
					Dir:      dep.Dir,
					IsVendor: strings.Contains(dep.Dir, "/vendor/"),
				})
			}
		}
	}

	return deps, nil
}
