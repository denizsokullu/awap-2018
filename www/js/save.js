function saveData(){
  data = {};
  // data.currentWord = SETTINGS.currentWord;
  var s = SETTINGS;

  //creating exported data
  data.EXPORTS = {};
  //word
  // data.EXPORTS.currentFont = s.currentFont;
  // data.EXPORTS.currentWord = s.currentWord;
  data.EXPORTS.currentWordLiteral = s.currentWordLiteral;
  data.EXPORTS.font = s.font;
  data.EXPORTS.fontSize = s.fontSize;

  //colors
  data.EXPORTS.color = s.color;
  data.EXPORTS.backgroundColor = s.backgroundColor;

  //Hover
  data.EXPORTS.hoverFunction = s.hoverFunction;
  data.EXPORTS.hoverStorage = {};
  Object.keys(s.hoverStorage).map((fname)=>{
    temp = s.hoverStorage;
    data.EXPORTS.hoverStorage[fname] = {};
    Object.keys(temp[fname]).map((parts)=>{
      cur = temp[fname][parts];
      if(typeof(cur) != "function"){
        console.log(cur);
        data.EXPORTS.hoverStorage[fname][parts] = cur;
      }
    })
  });

  //Shape
  data.EXPORTS.shape = s.shape;
  data.EXPORTS.shapeSize = s.shapeSize;
  data.EXPORTS.shapeXSize = s.shapeXSize;
  data.EXPORTS.shapeYSize = s.shapeYSize;

  data.EXPORTS.shapeStorage = {};
  Object.keys(s.shapeStorage).map((fname)=>{
    temp = s.shapeStorage;
    data.EXPORTS.shapeStorage[fname] = {};
    Object.keys(temp[fname]).map((parts)=>{
      cur = temp[fname][parts];
      if(typeof(cur) != "function"){
        console.log(cur);
        data.EXPORTS.shapeStorage[fname][parts] = cur;
      }
    })
  });

  data.EXPORTS.simplifyThreshold = s.simplifyThreshold;
  data.EXPORTS.stroke = s.stroke;
  data.EXPORTS.strokeColor = s.strokeColor;
  data.EXPORTS.strokeWeight = s.strokeWeight;

  data.id = window.location.search.split("=")[1];
  var image = new Image();
  canvas = document.getElementById("defaultCanvas0");
  src = canvas.toDataURL("image/png");
  data.image = src;
  data.title = "Test Title"
  tempObject = {};
  data.dataWrite = true;
  tempObject[data.id] = data;
  ref.update(tempObject);
}
