const MAX_UPLOAD = 2;


const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const app = express();
//Parsing forms
const bodyParser = require('body-parser');
const mkdirp = require('mkdirp');
app.use(bodyParser.urlencoded({extended: true}));
//loading pug
app.set('view engine', 'pug');
app.set('views', './views');




app.use(require('morgan')('dev'));

var session = require('express-session');
var FileStore = require('session-file-store')(session);

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));
app.use(function printSession(req, res, next) {
  // console.log('req.session', req.session);
  return next();
});

const path = require('path');
const url = require('url');
const { spawn } = require('child_process');
const compiler = webpack(webpackConfig);
const firebase = require('firebase');

//Required for using files
const fs = require('fs');
const fileUpload = require('express-fileupload');

var config = {
  apiKey: "AIzaSyDdO7qZmjt72EPQvPFq3-GktqwZCuR8YWA",
  authDomain: "awap-2018.firebaseapp.com",
  databaseURL: "https://awap-2018.firebaseio.com",
  projectId: "awap-2018",
  storageBucket: "",
  messagingSenderId: "1067834911251"
};

firebase.initializeApp(config);
var database = firebase.database();

// app.use(express.static(__dirname + '/www'));

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

// app.get('/', function initViewsCount(req, res, next) {
//   if (typeof req.session.views === 'undefined') {
//     req.session.views = 1;
//     return res.end('Welcome to the file session demo. Refresh page!');
//   }
//   return next();
// });

// Code structure
// / -> information about the competition link to login etc.
//
// /login -> handles login -> redirects to /loginFailed if wrong info
// /team -> has the upload form and the gallery of games to view
//          * The user clicks one of the logs and sends a AJAX request to load a
//            certain output script.
//          * The script then gets added to the canvas thats in the middle of
//            the screen and is executed to replay that certain output.
//          * Clicking another one while playing, pauses the replay and waits
//            until the new one has loaded.
//
// /upload -> handles file execution and properly adds the file into the users
//            repository and deletes the oldest one if limit is reached(MAX_UPLOAD).
//          * loads the /team page again once its successful or loads up a
//             /uploadFailed screen if something bad happens and that page has
//             a link to /team back again.
//          * things to do later - redirect in 5 seconds when in uploadFailed
// /scoreboard -> fetches the scoreboard info for each player
//          * initially public?
//          * later on final results are viewed
//          * links to the gameplay of each?
// /runTournament?=password -> runs the tournament?(implement later)

app.get('/', function (req, res) {
  if(typeof req.session.key === "undefined"){
    loginMessage = "Not Logged In";
  }
  else{
    loginMessage = "Logged In"
  }
  res.render('index',{title:req.session.__lastAccess,message:loginMessage});
});


app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  // console.log(req.body)
  var email = req.body.email;
  var key = req.body.key;
  currentUser = database.ref('/users/'+key);
  currentUser.on('value',function(data){
    if (data.val() == null){
      console.log("No such account");
      req.session.newError = true;
      req.session.errorMessage = "The key you provided does not match a team";
      res.redirect('/loginFailed');
    }
    else if (data.val().email != email){
      console.log("No such email");
      req.session.newError = true;
      req.session.errorMessage = "The email you have entered is not registered";
      res.redirect('/loginFailed');
    }
    else{
      req.session.key = key;
      res.redirect("/");
    }
  })
});

app.get('/loginFailed',function(req,res){
  console.log(req.session.newError);
  if(req.session.newError){
    req.session.newError = false;
    res.render('loginFailed',{errMessage:req.session.errorMessage});
  }
  else{
    res.redirect("/error");
  }
});

app.get('/team',function(req,res){
  //check if the user is logged in
  if(typeof req.session.key === "undefined"){
    res.redirect("/notLoggedIn");
  }
  else{
    //get team information

    //load the 10 scripts
    res.render("team");
  }
});

app.post('/upload',function(req,res){
    if(typeof req.session.key === "undefined"){
      res.redirect("/notLoggedIn");
    }
    if (!req.files){
      return res.status(400).send('No files were uploaded.');
    }
    var file = req.files.file;
    //add a uploadCounter to the database
    //keep track of how many they have uploaded
    //write into the req.session.key/filename = which should be the current counter
    currentFolderPath = path.join("uploads/"+req.session.key)
    mkdirp(currentFolderPath, function(err) {
      if(!err){
        fs.readdir(currentFolderPath,function(err,files){
          //max_upload limit has been reached, clean
          if(files.length >= MAX_UPLOAD){
            curFolder = files;
            targetFiles = [];
            while(curFolder.length >= MAX_UPLOAD){
              //add the filename that needs to be removed
              targetFiles.push(curFolder.splice(0,1)[0].split(".").splice(0,1));
            }
            console.log(targetFiles);
            //remove those from /uploads
            function err_callback(err){
              if(err){
                res.send(err);
              }
            }
            targetFiles.map((cur)=>{
              fs.unlink(path.join(currentFolderPath,cur+".py"),err_callback);
              outputPath = path.join("outputs/"+req.session.key);
              // and from /outputs
              fs.unlink(path.join(outputPath,cur+".js"),err_callback);
            });
          }
          //insta-FIFO!!!
          targetName = parseInt(Date.now());
          fs.writeFile(currentFolderPath+'/'+targetName+".py",file.data,(err)=>{
            if (err) throw err;
            res.redirect('/runCode?filename='+req.session.key+"/"+targetName);
          });
        });

      }
      else{
        res.send(err);
      }
    });
});

app.get('/runCode',function(req,res){
  const { spawn } = require('child_process');
  var process = spawn('python',['./uploads/'+req.query.filename+".py"]);
  //don't write the file here if the output isn't what we want!
  process.stdout.on('data', function(data){
  mkdirp(path.join(__dirname,'/outputs/'+req.session.key), function(err) {
    fs.writeFile(path.join("outputs/",req.query.filename+".js"),data,(err)=>{
        if (err) throw err;
        res.redirect("/team");
      });
    })
  })
})

app.get('/error',function(req,res){
  res.send("Incorrect URL");
})
app.get('/notLoggedIn',function(req,res){
  res.render("notLoggedIn");
})

// app.get('/success',function(req,res){
//   // dbID = database.ref('/users').push({email:"denizaydinsokullu@gmail.com"},function(){
//     res.send(req.session.test);
//   // });
// })
// app.get('/incorrect',function(req,res){
//   // dbID = database.ref('/users').push({email:"denizaydinsokullu@gmail.com"},function(){
//     res.send("incorrect");
//   // });
// })

//if create/id, go to that id by retrieving it in the front end
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, function() {
  console.log(`Listening at ${PORT}`);
});
