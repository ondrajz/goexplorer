//  containers
var visnetwork = document.getElementById('visnetwork');
var visconfig = document.getElementById('visconfig');

function toggleConfiguration() {
    if (visnetwork.style.width !== '70%') {
        visnetwork.style.width = '70%';
        return;
    }
    visnetwork.style.width = '100%';
}

// options
var visoptions = {
    nodes: {
        shape: 'dot',
        font: {
            size: 14,
            color: 'rgba(0,0,0,1)',
            strokeColor: 'rgba(250,250,250,1)',
            strokeWidth: 3
        },
        color: {
            border: '#080808',
            background: 'gray',
            hover: { border: '#E5CC67', background: 'lightyellow' },
            highlight: { border: '#5DB9BB', background: 'lightblue' },
        },
        shadow: {size: 4, x: -3, y: -3, color: 'rgba(0,0,0,0.4)'},
    },
    edges: {
        color: {
            color: '#444',
            hover: '#E5D594',
            highlight: '#79B9BB'
        }
    },
    physics: {
        //stabilization: false,
        maxVelocity: 30,
        barnesHut: {
            avoidOverlap: 0.1
        }
    },
    interaction: {
        hover: true
    },
    configure: {
        container: visconfig,
    },
    groups: {
        topLevels: {
            shape: 'circularImage',
            size: 14,
            color: { background: 'rgba(128,128,128,0.75)', border: '#080808' },
        },
        folders: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                size: 20,
                color: 'darkgray',
                code: '\uf07b'
            },
            /*shape: 'ellipse',
            color: {background: 'rgba(128,128,128,1)'},
            font: {
                color: 'white',
                //strokeColor: '#f8f8f8',
                strokeWidth: 3
            },*/
            mass: 2
        },
        files: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                size: 15,
                color: 'dimgray',
                code: '\uf016'
            },
        },
        sources: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                size: 15,
                color: 'lightskyblue',
                code: '\uf15c'
            },
        },
        packages: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                size: 30,
                color: '#78CCFF',
                code: '\uf1b2'
            },
            mass: 3
        },
        programs: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                size: 30,
                color: '#76C476',
                code: '\uf069'
            },
            mass: 3
        },
        objects: {
            shape: 'box',
            color: {
                background: 'aliceblue'
            },
            font: {
                color: '#111',
                multi: true,
                strokeWidth: 0,
                mono: {
                    color: '#333',
                    size: 10,
                    vadjust: 0
                }
            }
        },
    }
};

// network
var nodes = new vis.DataSet([ ]);
var edges = new vis.DataSet([ ]);
nodes.on('*', function (event, properties, senderId) {
  console.info('nodes event:', event, 'properties:', properties, 'senderId:', senderId);
});

var visdata = { nodes: nodes, edges: edges };
var network = new vis.Network(visnetwork, visdata, visoptions);

// cursor
var viscanvas = visnetwork.getElementsByTagName("canvas")[0];
function changeCursor(c){
    viscanvas.style.cursor = c;
}
network.on('hoverNode', function(){
    changeCursor('pointer');
});
network.on('blurNode', function(){
    changeCursor('default');
});

document.addEventListener('keydown', function(event) {
    console.debug("keydown", event);
    if (event.code === 'Delete') {
        var sel = network.getSelectedNodes();
        if (sel.length>0) {
            var id = sel[0];
            nodes.update({id: id, open: false});
            removeChildren(id);
            network.unselectAll();
        }
    }
}, false);

// GOPATH node
var nodeGopath = {
    id: '$GOPATH',
    label: '$GOPATH',
    title: 'explore $GOPATH',
    shape: 'image',
    image: './static/img/gopher.png',
    color: {
        background: '#888',
        border: '#111'
    },
    size: 22,
    mass: 5,
    dir: '.'
};
nodes.add(nodeGopath);

var hideChildren = function(nodeId, hide) {
    console.debug("hideChildren", nodeId, hide);
    var oldNode = nodes.get(nodeId);
    var i = 0;
    var parents = {};

    var upedges = [];
    var seledges = network.getConnectedEdges(nodeId);
    for (i=0; i<seledges.length; i++) {
        var seledge = edges.get(seledges[i]);
        if (seledge.from !== nodeId) {
            parents[seledge.from] = true;
            continue;
        }
        var e = { id: seledges[i] };
        if (hide) {
            e.color = {opacity: 0.5};
        }
        upedges.push(e);
    }

    var theNode = {
        id: nodeId,
        //font: {color: 'rgba(255,255,255,1)', strokeColor: 'rgba(0,0,0,1)'},
        //icon: {color: 'rgba(200,200,200,1)'}
    };
    if (hide) {
        //theNode.font = {color: 'rgba(200,200,200,0.2)', strokeColor: 'rgba(0,0,0,0.1)'};
        //theNode.icon = {color: 'rgba(128,128,128,0.5)'};
    }

    var upnodes = [theNode];
    var selnodes = network.getConnectedNodes(nodeId);
    for (i=0; i<selnodes.length; i++) {
        var selnode = nodes.get(selnodes[i]);
        if (selnode.id === nodeId || parents[selnode.id] === true) {
            continue;
        }
        var n = {
            id: selnodes[i],
            //font: {color: 'rgba(255,255,255,1)', strokeColor: 'rgba(0,0,0,1)'},
            //icon: {color: 'rgba(200,200,200,1)'},
            //color: {background: 'rgba(128,128,128,1)', border: 'rgba(128,128,128,1)'},
        };
        if (hide) {
            /*n.oldFont = {
                color: selnode.font.color,
                strokeColor: selnode.font.strokeColor,
            };*/
            //n.font = {color: 'rgba(200,200,200,0.5)', strokeColor: 'rgba(0,0,0,0.1)'};
            //n.icon = {color: 'rgba(128,128,128,0.5)'};
            //n.color = {background: 'rgba(128,128,128,0.25)', border: 'rgba(128,128,128,0.5)'};
        }else{
            /*if (selnode.oldFont) {
                n.font = selnode.oldFont;
                n.oldFont = undefined;
            //}else{
            //    n.font = {};
        }*/
        }
        upnodes.push(n);
    }

    console.log("upnodes", upnodes);

    nodes.update(upnodes);
    edges.update(upedges);
};

var removeChildren = function(nodeId) {
    console.debug("removeChildren", nodeId);
    var oldNode = nodes.get(nodeId);
    var i = 0;
    var parents = {};

    var upedges = [];
    var seledges = network.getConnectedEdges(nodeId);
    for (i=0; i<seledges.length; i++) {
        var seledge = edges.get(seledges[i]);
        if (seledge.from !== nodeId) {
            parents[seledge.from] = true;
            continue;
        }
        upedges.push(seledges[i]);
    }

    var upnodes = [];
    var selnodes = network.getConnectedNodes(nodeId);
    for (i=0; i<selnodes.length; i++) {
        var selnode = nodes.get(selnodes[i]);
        if (selnode.id === nodeId || parents[selnode.id] === true) {
            continue;
        }
        if (selnode.open) {
            removeChildren(selnode.id);
        }
        upnodes.push(selnodes[i]);
    }

    console.log("upnodes", upnodes);

    nodes.remove(upnodes);
    edges.remove(upedges);
};

network.on('selectNode', function(data){
    var node = nodes.get(data.nodes[0]);
    console.log("selectNode:", node.id, data);
    if (node.dir) {
        updatePath(node);
    }
});

network.on('deselectNode', function(data){
    var node = nodes.get(data.previousSelection.nodes[0]);
    console.log("deselectNode:", node.id, data);
    clearPath(node);
});

network.on('dragEnd', function(data){
    console.log("dragEnd:", data);
    if (data && data.nodes && data.nodes) {

    }
});

var clearPath = function(node) {
    if (!node && !node.id) {
        console.log("no node", node);
        return;
    }
    console.debug("clearPath:", node);
    hideChildren(node.id, true);
    //nodes.update([{id: node.id, open: false}]);
};

var updatePath = function(node) {
    if (!node && !node.id) {
        console.log("no node", node);
        return;
    }

    var p = '?';
    if (node.dir) {
        p += 'dir='+node.dir;
    }

    hideChildren(node.id, false);
    network.fit({
        nodes: network.getConnectedNodes(node.id),
        animation: {
            duration: 500,
            easingFunction: 'easeOutQuint'
        }
    });

    var opening = !node.open;
    console.debug("updatePath:", opening, node);
    if (!opening) {
        console.log("not opening", node);
        return;
    }

    var nodePos = network.getPositions(node.id);

    httpGetJson("/gopath"+p, function(data){
        console.log("gopath success:", data);
        var files = data;

        var nodeList = [];
        var edgeList = [];
        for (var i=0; i<files.length; i++) {
            var file = files[i];
            var n = {
                id: file.Id,
                label: file.Label,
                title: "<b>"+file.Loc+"</b>",
                value: file.Value,
                dir: file.Loc,
                hidden: false,
                font: {
                    size: 12,
                    //color: '#D8D8D8',
                    //strokeColor: '#080808',
                },
                x: nodePos.x,
                y: nodePos.y
            };
            if (file.Type === "topLevel") {
                n.group = 'topLevels';
                n.image = 'http://' + file.Label + '/favicon.ico';
                //n.brokenImage = '';
            }else if (file.Type === "folder") {
                n.group = 'folders';
            }else if (file.Type === "source"){
                n.group = 'sources';
            }else if (file.Type === "package"){
                n.group = 'packages';
            }else if (file.Type === "program"){
                n.group = 'programs';
            }else if (file.Type === "object"){
                n.group = 'objects';
            }else{
                n.group = 'files';
            }
            nodeList.push(n);

            var edgeId = node.id + '->' + file.Id;
            var e = {
                id: edgeId,
                from: node.id, to: file.Id,
                hidden: false
            };
            edgeList.push(e);
        }
        var par = {
            id: node.id,
            open: opening,
        };
        nodeList.push(par);
        /*if (node.imageOpen && opening) {
            console.log('imageOpen', node.imageOpen);
            n.image = node.imageOpen;
        }*/
        nodes.update(nodeList);
        edges.update(edgeList);

        network.selectNodes([node.id]);
    });
};

var httpGetJson = function(url, successCb) {
    var r = new XMLHttpRequest();
    r.responseType = "json";
    r.open("GET", url, true);
    r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200) return;
        successCb(r.response);
    };
    r.send();
};

//updatePath(nodeGopath);
