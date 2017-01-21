<div align="center"><img src="images/gopher.png" alt="GTM Logo"></div>
# <div align="center">Go Explorer</div>
[![Slack](https://img.shields.io/badge/gophers%20slack-%23goexplorer-ff69b4.svg)](https://gophers.slack.com/archives/goexplorer)

**Go Explorer** is an experimental tool to dynamically visualize Go packages using interactive overview.

[![screen](images/screen.png)](https://raw.githubusercontent.com/TrueFurby/goexplorer/master/images/screen.png)

## Introduction

Purpose of this project is to experiment with visualization of Go packages to aid developers by providing interactive overviews for various analyses, such as exploring package hierarchy, viewing package dependencies, examining call graph of a program, ..etc.

> The initial idea began during development of [go-callvis](https://github.com/TrueFurby/go-callvis#roadmap) and I've decided to develop *goexplorer* as a separate project, which is intended to provide more abstract approach.

### How it works

It has web server that serves the API and web application that uses [vis.js](http://visjs.org/) for visualization inside `<canvas>`.

## Features

**This project is currently at very early stage of development!** :warning:

- [x] explore hierarchy of $GOPATH
- [ ] view dependencies of a package
- [ ] examine call graph of a program

## Installation

#### Requirements

- [Go 1.7+](https://golang.org/dl/)

### Install

Use the following command to install:

```
go get -u github.com/TrueFurby/goexplorer
```

## Usage

### Quick start

Start the web server with

```
cd $GOPATH/src/github.com/TrueFurby/goexplorer
goexplorer
```

and open [http://localhost:8888](http://localhost:8888) in your browser.

#### Getting started

Clicking on nodes will retrieve content if any and add it's child nodes dynamically to the clicked node. By pressing <delete> key you can remove all child nodes of selected node.

Nodes with green laptop icon represent programs and nodes with blue box icon represent packages.

## Community

Join the [#goexplorer](https://gophers.slack.com/archives/goexplorer) channel at [gophers.slack.com](http://gophers.slack.com) (*not a member?* [get invitation](https://gophersinvite.herokuapp.com))

---
> did you find any bugs or have any suggestions? Feel free to open [new issue](https://github.com/TrueFurby/goexplorer/issues/new) or start discussion in our channel at slack
