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

    console.log(this.container);

    $(this.container).append(this.createDOM());
    // dom = "";
    // if(dx > 0 && dy > 0){
    //   startTarget = n1;
    //   dom = `<svg id="edge-${this.node1.id+"-"+this.node2.id}" width="${w+10}px" height="${h+10}px" style="top:${startTarget.y + r/2 - 5} ;left:${startTarget.x + r/2 - 5}">
    //             <line x1="0" y1="0" x2="${Math.abs(dx)}" y2="${Math.abs(dy)}"
    //             stroke-width="2" stroke="black"/>
    //          </svg>`
    // }
    // else if(dx > 0 && dy <= 0){
    //   startTarget = n1;
    //   y2 = parseFloat(h) + parseFloat(dy);
    //   dom = `<svg id="edge-${this.node1.id+"-"+this.node2.id}" width="${w+10}px" height="${h+10}px" style="top:${startTarget.y + r/2 - h - 5};left:${startTarget.x + r/2 - 5}">
    //             <line x1="0" y1="${h > 3 ? h : 0}" x2="${dx}" y2="${y2}"
    //             stroke-width="2" stroke="black"/>
    //          </svg>`
    // }
    // else if(dx <= 0 && dy > 0){
    //   startTarget = n2;
    //   x2 = parseFloat(w) + parseFloat(dx);
    //   dom = `<svg id="edge-${this.node1.id+"-"+this.node2.id}" width="${w+10}px" height="${h+10}px" style="top:${startTarget.y + r/2 - h - 5};left:${startTarget.x + r/2 -5}">
    //             <line x1="${w > 3 ? w : 0}" y1="0" x2="${x2}" y2="${dy}"
    //             stroke-width="2" stroke="black"/>
    //          </svg>`
    // }
    // else if(dx <= 0 && dy <= 0){
    //   startTarget = n2;
    //   y2 = parseFloat(h) + parseFloat(dy);
    //   x2 = parseFloat(w) + parseFloat(dx);
    //   dom = `<svg id="edge-${this.node1.id+"-"+this.node2.id}" width="${w+10}px" height="${h+10}px" style="top:${startTarget.y + r/2 -5};left:${startTarget.x + r/2 -5}">
    //             <line x1="${w > 3 ? w : 0}" y1="${h > 3 ? h : 0}" x2="${x2}" y2="${y2}"
    //             stroke-width="2" stroke="black"/>
    //          </svg>`
    // }

  }
  this.createDOM = function(){
    $("#"+this.id).remove();
    offset = this.node1.r / 2;
    var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
    newLine.setAttribute('id',this.id);
    newLine.setAttribute('x1',parseFloat(n1.x + offset).toFixed(3));
    newLine.setAttribute('y1',parseFloat(n1.y + offset).toFixed(3));
    newLine.setAttribute('x2',parseFloat(n2.x + offset).toFixed(3));
    newLine.setAttribute('y2',parseFloat(n2.y + offset).toFixed(3));
    $(this.container).append(newLine);
  }
}
