function Node(id,x,y,neighbors,container){
  this.id = id;
  this.container = container;
  this.pos = {};
  this.units = 10;
  this.occupant = '';
  this.colors = {1:"#f05656",2:"#b0dbfb",3:"#cbf0a0",4:"#b9c5ff"};
  // these need to be a square value
  this.pos.x = (x * $(container).height()) / graphRatio.x;
  this.pos.y = (y * $(container).height()) / graphRatio.y;
  // this.r = this.units < 16 ? 12 : Math.log(this.units)* 10;
  this.r = 48;

  this.animate = function(timeline,offset){
    timeline["node-"+this.id].add({
      targets: '#node-' + this.id,
      innerHTML: this.units,
      round: 1,
      backgroundColor:this.colors[this.occupant],
      color:"#FFF",
      easing: 'easeInOutExpo',
      offset: offset,
      duration: __settings.turnSpeed
    });
  }

  this.DOM = `<div class='node-container' id='node-${this.id}'
                style='
                       top:${this.pos.y}px;
                       left:${this.pos.x}px'
                <div class='node-inner'>
                  ${this.units}
                </div>
              </div`;

  //Does it need to know about it's neighbors?
  this.neighbors = neighbors;
  this.draw = function(){
    $(this.container).append(this.DOM);
    $($("#nodes").children()[parseInt(this.id)]).css({width:this.r,height:this.r});
  }

  this.update = function(newOccupant,newValue){
    if(newOccupant != this.occupant){
      this.units = newValue - this.units;
    }
    else{
      this.units += newValue;
    }
    this.occupant = newOccupant;
  }
}
