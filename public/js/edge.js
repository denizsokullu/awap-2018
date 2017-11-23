function Edge(node1,node2){
  this.node1 = node1;
  this.node2 = node2;
  this.draw = function(){
    n1 = this.node1.pos;
    n2 = this.node2.pos;
    stroke(255);
    strokeWeight(5);
    line(n1.x,n1.y,n2.x,n2.y);
  }
}
