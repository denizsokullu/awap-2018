function Edge(node1,node2){
  this.node1 = node1;
  this.node2 = node2;
  this.draw = function(){
    n1 = this.node1.pos;
    n2 = this.node2.pos;
    c = color(255,255,255);
    if(this.node1.c.levels[0] == this.node2.c.levels[0] && typeof(this.node1.c) != "undefined"){
      c = this.node1.c;
    }
    stroke(c);
    strokeWeight(5);
    line(n1.x,n1.y,n2.x,n2.y);
  }
}
