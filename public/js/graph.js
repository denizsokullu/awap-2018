g = {
  "0" : {x:30,y:200,n:["1","2","3","4"]},
  "1" : {x:100,y:150,n:["0","4","6","5"]},
  "2" : {x:280,y:240,n:["0","3","6","10"]},
  "3" : {x:230,y:400,n:["0","1","2","4"]},
  "4" : {x:700,y:340,n:["0","3"]},
  "5" : {x:420,y:30,n:["1","10","6"]},
  "6" : {x:304,y:480,n:["1","2","5"]},
  "7" : {x:500,y:500,n:["1","10","5"]},
  "8" : {x:340,y:280,n:["4","0","5"]},
  "9" : {x:100,y:40,n:["1","8","5"]},
  "10" : {x:20,y:430,n:["8","4","5"]}
}

graphRatio = {x:9,y:9};

function createGraph(g){
  graphData = new Graph(g);
  graphData.createNodes();
  graphData.createEdges(graphData);
  graphData.drawEdges();
  graphData.drawNodes();
  return graphData;
}


function Graph(nodes){
  this.nodeData = nodes;
  this.nodes = [];
  this.edges = [];
  this.createNodes = function(){
    nodeIDs = Object.keys(this.nodeData);
    for(var i = 0; i < nodeIDs.length; i++){
      key = nodeIDs[i];
      nodes = this.nodeData;
      x = nodes[key].x;
      y = nodes[key].y;
      this.nodes.push(new Node(key,                  // id
                               x,  // x location
                               y, // y location
                               nodes[key].n,
                               '#nodes'
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
  this.updateNode = function(nodeid,occupant,value){
    console.log(nodeid);
    this.nodes[nodeid].update(occupant,value,timeline,offset);
  }
  this.animateNode = function(nodeid,timeline,offset){
    this.nodes[nodeid].animate(timeline,offset);
  }
}
