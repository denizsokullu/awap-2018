graphRatio = {x:9,y:9};

function createGraph(g,startNodes){
  graphData = new Graph(g);
  graphData.createNodes(startNodes);
  graphData.createEdges(graphData);
  graphData.drawEdges();
  graphData.drawNodes();
  return graphData;
}


function Graph(nodes){
  this.nodeData = nodes;
  this.nodes = [];
  this.edges = [];
  this.scores = {
    1:new Score(1),
    2:new Score(2),
    3:new Score(3),
    4:new Score(4)
  }
  this.createNodes = function(startNodes){
    nodeIDs = Object.keys(this.nodeData);

    //transform the start node data
    startingLocs = Object.keys(startNodes).map(function(keys){
      return startNodes[keys];
    });
    startNodes = {};
    startingLocs.map(function(node){
      nodeID = Object.keys(node)[0];
      startNodes[nodeID] = node[nodeID].owner
    })

    for(var i = 0; i < nodeIDs.length; i++){
      key = nodeIDs[i];
      nodes = this.nodeData;
      x = nodes[key].x;
      y = nodes[key].y;
      if(startNodes[key]){
        owner = startNodes[key]
      }
      else{
        owner = 0;
      }
      this.nodes.push(new Node(key,                  // id
                               x,  // x location
                               y, // y location
                               nodes[key].n,
                               '#nodes',
                               owner
                             ));
    }
  }
  this.createEdges = function(self){
    nodeIDs = Object.keys(this.nodeData);
    baseEdges = [];
    //for each node, create an array of edges.
    for(var i = 0; i < nodeIDs.length; i++){
      key = nodeIDs[i];
      curEdges = this.nodeData[key].n;
      temp = new Array(this.nodeData[key].n.length).fill(key)
      for(var j = 0; j < curEdges.length; j++){
        temp[j] = [temp[j]];
        temp[j].push(curEdges[j]);
      }
      baseEdges.push(temp);
    }
    //flatten the array
    edges = [].concat.apply([],baseEdges);
    //get rid of duplicates
    edges = edges.unique(function(x,y){
      return (x[0] == y[0] && x[1] == y[1]) || (x[0] == y[1] && x[1] == y[0])
    })
    finalEdges = [];
    for (var i = 0; i < edges.length; i ++){
      //find the nodes
      node1 = self.nodes.find(function(el){
        return (el.id == edges[i][0]);
      });
      node2 = self.nodes.find(function(el){
        return (el.id == edges[i][1]);
      });
      curEdge = new Edge(node1,node2,"#edges-container");
      finalEdges.push(curEdge);
    }
    self.edges = finalEdges;
  }
  this.drawEdges = function(){
    edges = this.edges;
    dom = `<svg id="edges-container" width="100%" height="100%"></svg>`;
    $(window).ready(function(){
      $("#edges").append(dom);
      for(var i =0; i < edges.length; i++){
        edges[i].draw();
      }
    })
  }

  this.drawNodes = function(){
    nodes = this.nodes;
    $(window).ready(function(){
      for(var i = 0; i < nodes.length; i++){
        nodes[i].draw();
      }
    });
  }
  this.createNodeDOMs = function(){
    this.nodes.forEach(function(node){
      node.createDOM();
    })
  }
  this.updateNode = function(nodeid,occupant,value){
    this.nodes[nodeid].update(occupant,value);
  }
  this.animateNode = function(nodeid,timeline,offset){
    this.nodes[nodeid].animate(timeline,offset);
  }
}

function Score(owner){
  this.score = 1;
  this.owner = owner;
  this.updateScore = function(newScore){
    this.score = newScore
  }
  this.animateScore = function(timeline,offset){
    offset += __settings.turnSpeed / 2
    timeline['node-0'].add({
      targets: '#team' + this.owner,
      height: `${(this.score / __settings.nodeCount) * 100}%`,
      easing: 'easeInQuad',
      offset: offset,
      duration: 0
    });
    timeline['node-0'].add({
      targets: '#team' + this.owner + ' span',
      innerHTML: this.score,
      round: 1,
      easing: 'easeInQuad',
      offset: offset,
      duration: 0
    });
  }
}
