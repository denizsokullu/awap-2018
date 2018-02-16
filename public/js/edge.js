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
      // dom = `<style type="text/css">
      //       	.st0{fill:none;stroke:#FFE340;stroke-width:5.5;stroke-miterlimit:10;}
      //       	.st1{fill:none;stroke:#919191;stroke-width:5;stroke-miterlimit:10;}
      //       	.st2{fill:none;stroke:#FFFFFF;stroke-width:0.5;stroke-miterlimit:10;}
      //       	.st3{fill:none;stroke:#FFFFFF;stroke-width:0.5;stroke-miterlimit:10;stroke-dasharray:3.8117,2.8588;}
      //       </style>
      //       <line class="st0" x1="5.9" y1="6" x2="34.1" y2="6"/>
      //       <g>
      //       	<g>
      //       		<polyline class="st2" points="31.4,6 33.4,6 31.4,6 		"/>
      //       		<line class="st3" x1="28.6" y1="6" x2="10" y2="6"/>
      //       		<polyline class="st2" points="8.6,6 6.6,6 8.6,6 		"/>
      //       		<line class="st3" x1="11.4" y1="6" x2="30" y2="6"/>
      //       	</g>
      //       </g>`
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
    outerYellow.setAttribute('stroke-width',"6");
    outerYellow.setAttribute('stroke',"#f9d938");

    //main road line
    var asphalt = document.createElementNS('http://www.w3.org/2000/svg','line');
    asphalt.setAttribute('class','asphalt');
    asphalt.setAttribute('x1',parseFloat(n1.x + offset).toFixed(3));
    asphalt.setAttribute('y1',parseFloat(n1.y + offset).toFixed(3));
    asphalt.setAttribute('x2',parseFloat(n2.x + offset).toFixed(3));
    asphalt.setAttribute('y2',parseFloat(n2.y + offset).toFixed(3));
    asphalt.setAttribute('stroke-width',"5");
    asphalt.setAttribute('stroke',"#AAA");

    //inner dashed line
    var innerDashed = document.createElementNS('http://www.w3.org/2000/svg','line');
    innerDashed.setAttribute('class','dashed');
    innerDashed.setAttribute('x1',parseFloat(n1.x + offset).toFixed(3));
    innerDashed.setAttribute('y1',parseFloat(n1.y + offset).toFixed(3));
    innerDashed.setAttribute('x2',parseFloat(n2.x + offset).toFixed(3));
    innerDashed.setAttribute('y2',parseFloat(n2.y + offset).toFixed(3));
    innerDashed.setAttribute('stroke-width',"1");
    innerDashed.setAttribute('stroke-dasharray',"5, 5");
    innerDashed.setAttribute('stroke',"#FFF");


    $(container).append(outerYellow);
    $(container).append(asphalt);
    $(container).append(innerDashed);
    $(this.container).append(container);

  }
}
