# Go Explorer ![gopher](images/gopher.png)
[![Slack](https://img.shields.io/badge/gophers%20slack-%23goexplorer-ff69b4.svg)](https://gophers.slack.com/archives/goexplorer)

**Go Explorer** is an experimental tool to dynamically visualize Go packages using interactive overview.

[![screen](images/screen.png)](https://raw.githubusercontent.com/TrueFurby/goexplorer/master/images/screen.png)

## Introduction

Purpose of this project is to experiment with visualization of Go packages to aid developers by providing interactive overviews for various analyses. For example; exploring $GOPATH hierarchy, viewing package dependencies, examining call graph of a program, etc.

The initial idea began during development of [**go-callvis**](https://github.com/TrueFurby/go-callvis#roadmap), but I've decided to develop **goexplorer** as a separate project, because I found the name *go-callvis* unfitting for the desired scope.

### How it works

It has web server that serves the API and web application that uses [vis.js](http://visjs.org/) for visualization inside `<canvas>`.

## Features

**This project is currently at very early stage of development!** :warning:

- [x] explore hierarchy of $GOPATH
- [ ] view dependencies of a package
- [ ] examine call graph of a program


> did you find any bugs or have any suggestions? Feel free to open [new issue](https://github.com/TrueFurby/goexplorer/issues/new) or start discussion in our channel at slack

## Installation

#### Requirements

- [Go](https://golang.org/dl/) 1.7+

### Install

Use the following command to install:

```
go get -u github.com/TrueFurby/goexplorer
```

### Quick start

Start the web server using following commands:

```
cd $GOPATH/src/github.com/TrueFurby/goexplorer
goexplorer
```

and go to http://localhost:8888.

> run `goexplorer -h` for usage help

## Community

Join the [#goexplorer](https://gophers.slack.com/archives/goexplorer) channel at [gophers.slack.com](http://gophers.slack.com) (*not a member?* [get invitation](https://gophersinvite.herokuapp.com))

