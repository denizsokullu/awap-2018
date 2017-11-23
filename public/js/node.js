function Node(id,x,y,neighbors){
  this.id = id;
  this.pos = {};
  this.pos.x = x;
  this.pos.y = y;
  this.c = SETTINGS.initialColor;
  this.number = random(0,10);
  this.r = 50;
  //Does it need to know about it's neighbors?
  this.neighbors = neighbors;
  this.draw = function(){
    push();
    translate(this.pos.x,this.pos.y)
    ellipseMode(CENTER);
    strokeWeight(0);
    fill(this.c);
    ellipse(0,0,this.r,this.r)
    fill(255);
    translate(-5,4);
    textSize(16);
    rectMode(CENTER);
    text(parseInt(this.number),0,0);
    pop();
  }
  this.updateValue = function(newOccupant,newValue){
    //this should trigger an update on the edges related.
    //call it recursively?
    //or handle each edge should update;
  }
}
