var container = document.getElementById('visnetwork');
var configurator = document.getElementById('visconfig');

// vis config
var options = {
    nodes: {
        shape: 'ellipse',
        //font: '12px verdana #000',
        font: {
            color: 'lightcyan',
            face: 'verdana',
            size: 18,
            //strokeWidth: 2,
            //strokeColor: 'darkgray',
            //mod: 'bold'
        },
        color: {
            border: '#222', background: 'lightgray',
            highlight: { border: '#05B', background: '' },
            hover: { border: '#F1C40F', background: 'lightyellow' },
        },
        shadow: {size: 5, x: -4, y: -3},
        chosen: {
            label:  function(values, id, selected, hovering) {
                if (hovering) {
                    values.color = '#000';
                }else{
                    values.color = '#888';
                }
                if (selected) {
                    values.mod = 'bold';
                }else{
                    values.mod = '';
                }
              }
        }
    },
    edges: {
        color: { color: '#888', hover: '#05B', highlight: '#d6b225', opacity: 0.75 },
        hoverWidth: function (width) {return width+1;}
    },
    physics: {
        stabilization: false
    },
    interaction: {
        hover: true
    },
    configure: {
        container: configurator,
    }
};


// Gopher
var nodeGopher = {
    id: 'goexplorer',
    //label: 'gopher',
    title: '<b>gopher</b>',
    shape: 'image',
    image: './static/img/gopher.png',
    size: 35,
    borderWidth: 1,
    font: { size: 18 },
    color: {
        background: 'rgba(0,0,0,0)',
        border: '#000'
    }
};

// GOPATH
var nodeGopath = {
    hidden: true,
    id: '$GOPATH',
    label: 'explore\n$GOPATH',
    title: '# $GOPATH<br>Explore $GOPATH',
    borderWidth: 1,
    shape: 'box',
    font: {
        size: 16,
        strokeWidth: 2,
        strokeColor: 'snow',
        mod: 'bold'
    },
    //chosen: false,
    margin: 10,
    color: {
        background: 'lightsteelblue',
        border: '#111'
    }
};

var nodes = new vis.DataSet([ nodeGopher, nodeGopath ]);
var edges = new vis.DataSet([
    { from: nodeGopher.id, to: nodeGopath.id, color: '#000', opacity: 1, length: 50, hidden: true }
 ]);
 var data = { nodes: nodes, edges: edges };
var network = new vis.Network(container, data, options);

var toggleVisConfig = function() {
    //console.debug("q:", window.location.search);
    if (container.style.width !== '70%') {
        container.style.width = '70%';
        return;
    }
    container.style.width = '100%';
};

network.on('click', function(data){
    if (data && data.nodes && data.nodes.length > 0) {
        var node = nodes.get(data.nodes[0]);
        if (node.id === nodeGopher.id) {
            var upnodes = [];
            var selnodes = network.getConnectedNodes(node.id);
            console.log("click gopher", node, selnodes);
            for (var i=0; i<selnodes.length; i++) {
                var sel = selnodes[i];
                upnodes.push({
                    id: sel,
                    hidden: false,
                });
            }
            nodes.update(upnodes);
            return;
        }
        updateNode(node);
    }
});

var updateNode = function(node) {
    if (!node) {
        console.log("no node", node);
        return;
    }
    var r = new XMLHttpRequest();
    r.responseType = "json";
    var p = '?';
    if (node.dir) {
        p += 'dir='+node.dir;
    }
    console.debug("updateNode:", p);
    r.open("GET", "/gopath"+p, true);
    r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200) return;
        var data = r.response;
        console.log("gopath success:", data);
        var nodeList = [];
        var edgeList = [];
        //edges.clear();
        for (var i=0; i<data.length; i++) {
            var f = data[i];
            var dir = f.Name;
            if (node.dir) {
                dir = node.dir+'/'+dir;
            }
            var n = {id: dir, label: f.Name, shape: 'box', dir: dir, title: dir};
            if (f.IsDir) {
                n.color = {background: 'lightblue'};
            }
            if (node.dir===undefined) {
                n.shape = 'circularImage';
                n.image = 'http://' + dir + '/favicon.ico';
                n.brokenImage = '';
            }
            if (n.Size) {
                n.value = n.Size;
            }
            nodeList.push(n);
            var edgeId = node.id + '->' + dir
            var e = {id: edgeId, from: node.id, to: dir};
            edgeList.push(e);
        }
        nodes.update(nodeList);
        edges.update(edgeList);
    };
    r.send();
};
//updateNode(nodeGopath);
