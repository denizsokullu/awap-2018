SETTINGS = {};
canvasWidth = 830;
canvasHeight = 600;
counter = 0;
g = {
  "a" : {x:30,y:200,n:["b","c","d","e"]},
  "b" : {x:100,y:150,n:["a","d","g","f"]},
  "c" : {x:280,y:240,n:["a","d","g","f"]},
  "d" : {x:230,y:400,n:["a","b","c","e"]},
  "e" : {x:700,y:340,n:["a","d"]},
  "f" : {x:420,y:30,n:["b","c","g"]},
  "g" : {x:304,y:480,n:["b","c","f"]}
}

function setup(){
  SETTINGS.turns = 1000;
  SETTINGS.initialColor = color(50,10,140);
  graphData = new Graph(g);
  graphData.createNodes();
  graphData.createEdges(graphData);
  canvas = createCanvas(canvasWidth,canvasHeight);
  canvas.parent("canvas");
}
function draw(){
  background(120);
  graphData.drawEdges();
  graphData.drawNodes();
  counter ++;
  if((counter % 120 == 0)){
    counter = 0;
    graphData.updateNodes([]);
  }

}
