function Node(id,x,y,neighbors,container,owner){
  this.id = id;
  this.container = container;
  this.pos = {};
  this.units = 10;
  this.occupant = owner;
  this.events = {occupant:false,increase:false,decrease:false,lastOccupant:owner}
  this.colors = {0:"#CCC",1:"#f05656",2:"#b0dbfb",3:"#cbf0a0",4:"#b9c5ff"};
  // these need to be a square value
  this.pos.x = (x * $(container).height()) / graphRatio.x;
  this.pos.y = (y * $(container).height()) / graphRatio.y;
  // this.r = this.units < 16 ? 12 : Math.log(this.units)* 10;
  this.r = 48;
  this.iconSize = 36;

  this.eventFired = function(e){
    if(this.events[e]){
      this.events[e] = false;
      return true;
    }
    return false;
  }

  this.animate = function(timeline,offset){
    //Change the console.logs with animations
    if(this.eventFired('occupant')){
      curXpos = parseInt(this.events.lastOccupant) * -1 * this.iconSize;
      xpos = parseInt(this.occupant) * -1 * this.iconSize;
      dur = __settings.turnSpeed / 2;
      timeline["node-"+this.id].add({
        targets: '#node-' + this.id + ' .owner-icon',
        backgroundPosition:[
          {value:`${curXpos} 36px`,duration:dur*.25,delay:0},
          {value:`${xpos}px 36px`,duration:dur*.1,delay:dur*.25},
          {value:`${xpos}px 0`,duration:dur*.65,delay:dur*.35}
        ],
        // backgroundColor:this.colors[this.occupant],
        // color:"#FFF",
        easing: 'easeInQuad',
        offset: offset + __settings.turnSpeed / 2,
        // duration: 1
      });
      // console.log("Occupant changed!",this.id);
    }
    else if(this.eventFired('decrease')){
      // console.log("Units decreased!",this.id);
    }
    else if(this.eventFired('increase')){
      // console.log("Units increased!",this.id);
    }
    timeline["node-"+this.id].add({
      targets: '#node-' + this.id + ' .node-inner',
      innerHTML: this.units,
      round: 1,
      easing: 'easeInQuad',
      offset: offset,
      duration: __settings.turnSpeed / 2
    });
  }

  this.DOM = `<div class='node-container' id='node-${this.id}'
                style='
                       top:${this.pos.y - (this.r/2)}px;
                       left:${this.pos.x - (this.r/2)}px;'>
                <div class='owner-icon' style='background-position:${parseInt(this.occupant) * -1 * this.iconSize}px 0;'></div>
                <div class='node-inner'>${this.units}</div>
              </div`;


  //Does it need to know about it's neighbors?
  this.neighbors = neighbors;
  this.draw = function(){
    $(this.container).append(this.DOM);
    $($("#nodes").children()[parseInt(this.id)]).css({'width':this.r,
                                                      'height':this.r});
  }

  this.update = function(newOccupant,newValue){
    //never turns 0
    //if different occupants, same amount, occupant doesn't change count becomes 1
    //if different occupants, different amount, subtract.
    if(newOccupant != this.occupant){
      if(this.units - newValue == 0){
        this.events.decrease = true;
        //decrease in units
        this.units = 1;
      }
      else if(this.units - newValue > 0){
        //decrease in units
        this.events.decrease = true;
        this.units -= newValue;
      }
      else{
        //took control
        this.units = newValue - this.units;
        this.events.occupant = true;
        this.events.lastOccupant = this.occupant;
        this.occupant = newOccupant;
      }
    }
    else{
      //increase in units
      if(newValue > 0){
        this.events.increase = true;
      }
      //decrease in units
      else{
        this.events.decrease = true;
      }
      this.units += newValue;
    }
    // console.log(this.units);
  }
}
