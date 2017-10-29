const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const app = express();
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');
const formidable = require('formidable');
const compiler = webpack(webpackConfig);
const fs = require('fs');
const fileUpload = require('express-fileupload');

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
app.use(fileUpload());
// TESTING
app.get('/',function(req,res){
  const { spawn } = require('child_process');
  var process = spawn('python',['./script.py']);
    process.stdout.on('data', function(data){
    res.send("executed!");
  })
})
app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  var file = req.files.file;
  // Use the mv() method to place the file somewhere on your server
  fs.writeFile(path.join("uploads/",file.name),file.data,(err)=>{
    if (err) throw err;
    res.redirect('/runCode?filename='+file.name);
  });
});

app.get('/runCode',function(req,res){
  const { spawn } = require('child_process');
  var process = spawn('python',['./uploads/'+req.query.filename]);
    process.stdout.on('data', function(data){
    console.log(data);
    res.redirect("/success");
  })
})

app.get('/success',function(req,res){
  res.send("successful!");
})

//if create/id, go to that id by retrieving it in the front end
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, function() {
  console.log(`Listening at ${PORT}`);
});
