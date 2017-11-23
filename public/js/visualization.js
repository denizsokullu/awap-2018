SETTINGS = {};
canvasWidth = 830;
canvasHeight = 600;

g = {
  "a" : ["b","c","d","e"],
  "b" : ["a","d","g","f"],
  "c" : ["a","d","g","f"],
  "d" : ["a","b","c","e"],
  "e" : ["a","d"],
  "f" : ["b","c","g"],
  "g" : ["b","c","f"]
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
}
