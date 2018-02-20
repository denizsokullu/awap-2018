function Edge(node1,node2,container){
  this.node1 = node1;
  this.node2 = node2;
  this.container = container;
  this.id = "edge-"+this.node1.id+"-"+this.node2.id;
  this.draw = function(){

    n1 = this.node1.pos;
    n2 = this.node2.pos;

    dx = (n2.x - n1.x).toFixed(4);
    dy = (n2.y - n1.y).toFixed(4);
    r = this.node1.r;

    w = Math.max(Math.abs(n1.x - n2.x).toFixed(4),3);
    h = Math.max(Math.abs(n1.y - n2.y).toFixed(4),3);

    $(this.container).append(this.createDOM());
  }
  this.createDOM = function(){
    $("#"+this.id).remove();
    // offset = this.node1.r / 2;
    offset = 0;
    //container
    var container = document.createElementNS('http://www.w3.org/2000/svg','g');
    container.setAttribute('id',this.id);

    //outer border
    var outerYellow = document.createElementNS('http://www.w3.org/2000/svg','line');
    outerYellow.setAttribute('class','outerYellow');
    outerYellow.setAttribute('x1',parseFloat(n1.x + offset).toFixed(3));
    outerYellow.setAttribute('y1',parseFloat(n1.y + offset).toFixed(3));
    outerYellow.setAttribute('x2',parseFloat(n2.x + offset).toFixed(3));
    outerYellow.setAttribute('y2',parseFloat(n2.y + offset).toFixed(3));
    outerYellow.setAttribute('stroke-width',10);
    outerYellow.setAttribute('stroke',"#FCB61A");

    //main road line
    var asphalt = document.createElementNS('http://www.w3.org/2000/svg','line');
    asphalt.setAttribute('class','asphalt');
    asphalt.setAttribute('x1',parseFloat(n1.x + offset).toFixed(3));
    asphalt.setAttribute('y1',parseFloat(n1.y + offset).toFixed(3));
    asphalt.setAttribute('x2',parseFloat(n2.x + offset).toFixed(3));
    asphalt.setAttribute('y2',parseFloat(n2.y + offset).toFixed(3));
    asphalt.setAttribute('stroke-width',8);
    asphalt.setAttribute('stroke',"#444");

    //inner dashed line
    var innerDashed = document.createElementNS('http://www.w3.org/2000/svg','line');
    innerDashed.setAttribute('class','edge');
    innerDashed.setAttribute('x1',parseFloat(n1.x + offset).toFixed(3));
    innerDashed.setAttribute('y1',parseFloat(n1.y + offset).toFixed(3));
    innerDashed.setAttribute('x2',parseFloat(n2.x + offset).toFixed(3));
    innerDashed.setAttribute('y2',parseFloat(n2.y + offset).toFixed(3));
    innerDashed.setAttribute('stroke-width',"2");
    // innerDashed.setAttribute('stroke-dasharray',"5, 5");
    innerDashed.setAttribute('stroke',"#888");


    // $(container).append(outerYellow);
    // $(container).append(asphalt);
    $(container).append(innerDashed);
    $(this.container).append(container);

  }
}
