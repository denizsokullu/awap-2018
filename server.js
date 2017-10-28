const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const app = express();
const url = require('url');
const firebase = require('firebase');
const { spawn } = require('child_process');
var config = {
  apiKey: "AIzaSyBgccrWZFk0uWNiys5_AIsd9msCJIaxSMg",
  authDomain: "computational-design.firebaseapp.com",
  databaseURL: "https://computational-design.firebaseio.com",
  projectId: "computational-design",
  storageBucket: "",
  messagingSenderId: "597250126920"
};

firebase.initializeApp(config);
var database = firebase.database();

const compiler = webpack(webpackConfig);

app.use(express.static(__dirname + '/www'));

app.use(webpackDevMiddleware(compiler, {
  hot: true,
  filename: 'bundle.js',
  publicPath: '/',
  stats: {
    colors: true,
  },
  historyApiFallback: true,
}));

app.get('/',function(req,res){
  res.sendFile(__dirname + '/www/index.html');
})
app.get('/generativeTypewriter/new',function(req,res,next){
  //instead of generating smth here on your own,
  //generate an empty submission to
  newCanvasId = Math.random().toString(36).substring(2);
  var ref = database.ref('generativeTypewriter/creations');
  var newRef = ref.push({dataWrite:false},function(){
    res.redirect(url.format({
      pathname:"/generativeTypewriter/create",
      query:{
        id:newRef.key
      }
    }));
  });

})
app.get('/generativeTypewriter/gallery',function(req,res){
  res.sendFile(__dirname + '/www/gallery.html');
})
app.get('/generativeTypewriter/create',function(req,res){
  res.sendFile(__dirname + '/www/generativeTypewriter/index.html');
})

// TESTING
app.get('/test',function(req,res){
  const { spawn } = require('child_process');
  var process = spawn('python',['./script.py']);
    process.stdout.on('data', function(data){
    res.send(data);
  })
})


//if create/id, go to that id by retrieving it in the front end
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, function() {
  console.log(`Listening at ${PORT}`);
});
