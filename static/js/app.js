var container = document.getElementById('visnetwork');
var configurator = document.getElementById('visconfig');

// vis config
var options = {
    nodes: {
        font: {
            color: 'white',
            face: 'verdana',
            size: 14,
            strokeWidth: 3,
            strokeColor: 'black',
        },
        color: {
            border: '#111',
            background: 'lightgray',
            hover: { border: '#05B', background: 'lightblue' },
            highlight: { border: '#F1C40F', background: 'lightyellow' },
        },
        shadow: {size: 3, x: -3, y: -2},
    },
    edges: {
        color: {
            color: '#666',
            hover: '#05B',
            highlight: '#d6b225'
        }
    },
    physics: {
        stabilization: false,
        maxVelocity: 35,
        barnesHut: {
            avoidOverlap: 0.1
        }
    },
    interaction: {
        hover: true
    },
    configure: {
        container: configurator,
    },
    groups: {
        topLevels: {
            shape: 'circularImage',
            size: 25
        },
        folders: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                size: 25,
                color: 'lightgray',
                code: '\uf07b'
            }
        },
        files: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                size: 20,
                color: 'dimgray',
                code: '\uf15b'
            }
        }
    }
};

// Gopher
var nodeGopher = {
    id: 'goexplorer',
    title: '<b>gopher</b>',
    shape: 'image',
    image: './static/img/gopher.png',
    size: 15,
    borderWidth: 1,
    color: {
        background: 'rgba(0,0,0,0)',
        border: 'rgba(0,0,0,0)'
    }
};

// GOPATH
var nodeGopath = {
    id: '$GOPATH',
    label: '$GOPATH',
    title: 'explore $GOPATH',
    shape: 'text',
    font: {
        color: 'black',
        size: 16,
        strokeWidth: 4,
        strokeColor: 'snow',
    },
    labelHighlightBold: false,
    color: {
        background: '#888',
        border: '#111'
    }
};

var nodes = new vis.DataSet([ nodeGopher, nodeGopath ]);
var edges = new vis.DataSet([
    // gopher -> gopath
    { from: nodeGopher.id, to: nodeGopath.id,
        color: '#111', width: 0.25, smooth: false }
 ]);
var visdata = { nodes: nodes, edges: edges };
var network = new vis.Network(container, visdata, options);

var networkCanvas = container.getElementsByTagName("canvas")[0];
function changeCursor(newCursorStyle){
    networkCanvas.style.cursor = newCursorStyle;
}

network.on('hoverNode', function(){
    changeCursor('pointer');
});
network.on('blurNode', function(){
    changeCursor('default');
});

var toggleVisConfig = function() {
    //console.debug("q:", window.location.search);
    if (container.style.width !== '70%') {
        container.style.width = '70%';
        return;
    }
    container.style.width = '100%';
};

var unhideChildren = function(nodeId) {
    var i = 0;
    var selnodes = network.getConnectedNodes(nodeId);
    var upnodes = [];
    for (i=0; i<selnodes.length; i++) {
        upnodes.push({ id: selnodes[i], hidden: false });
    }
    nodes.update(upnodes);
    var seledges = network.getConnectedEdges(nodeId);
    var upedges = [];
    for (i=0; i<seledges.length; i++) {
        upedges.push({ id: seledges[i], hidden: false });
    }
    edges.update(upedges);
};

network.on('click', function(data){
    if (data && data.nodes && data.nodes.length > 0) {
        var node = nodes.get(data.nodes[0]);
        if (node.id === nodeGopher.id) {
            console.log("click gopher", node);
            unhideChildren(node.id);
            return;
        }
        updatePath(node);
    }
});

var updatePath = function(node) {
    if (!node) {
        console.log("no node", node);
        return;
    }

    var p = '?';
    if (node.dir) {
        p += 'dir='+node.dir;
    }
    console.debug("updatePath:", p);

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
                title: "explore <b>"+file.Loc+"</b>",
                value: file.Size,
                dir: file.Loc,
                font: '12px verdana #D8D8D8',
            };
            if (file.Type === "topLevel") {
                n.group = 'topLevels';
                n.image = 'http://' + file.Label + '/favicon.ico';
                //n.brokenImage = '';
            }else if (file.Type === "folder") {
                n.group = 'folders';
            }else{
                n.group = 'files';
            }
            nodeList.push(n);

            var edgeId = node.id + '->' + file.Id;
            var e = {id: edgeId, from: node.id, to: file.Id};
            edgeList.push(e);
        }
        nodes.update(nodeList);
        edges.update(edgeList);

        network.selectNodes([node.id]);
        network.fit({
            nodes: network.getConnectedNodes(node.id),
            animation: {
                duration: 500,
                easingFunction: 'easeOutQuint'
            }
        });
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

network.selectNodes([nodeGopher.id]);
