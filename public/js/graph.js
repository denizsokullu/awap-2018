
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
                               nodes[key].n
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
      curEdge = new Edge(node1,node2);
      finalEdges.push(curEdge);
    }
    self.edges = finalEdges;
  }
  this.drawEdges = function(){
    for(var i =0; i < this.edges.length; i++){
      this.edges[i].draw();
    }
  }
  this.drawNodes = function(){
    for(var i =0; i < this.nodes.length; i++){
      this.nodes[i].draw();
    }
  }
  this.updateNodes = function(data){
    //this should be calling node.update
    for(var i = 0; i < this.nodes.length; i++){
      b = Math.floor(random(255) / 50);
      r = b * 50;
      console.log(r);
      this.nodes[i].c = color(r,r,r);
      this.nodes[i].number = b;
    }
  }
}
