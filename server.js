
//Make admin access only
//Create routes
//CHECK THE FILESIZE, FILETYPE of the upload
//figure out what fileError function is

/////////////////////////////
// Constants declared by AWAP

const MAX_UPLOAD = 2;

/////////////////////////////

const express = require('express');
const app = express();

//Parsing forms
const bodyParser = require('body-parser');
const mkdirp = require('mkdirp');

const path = require('path');
const url = require('url');
const { spawn } = require('child_process');
const firebase = require('firebase');

const fs = require('fs');
const fileUpload = require('express-fileupload');


app.use(bodyParser.urlencoded({extended: true}));
//loading pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname,'./public')));


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
//Required for using files
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

app.use(fileUpload());

app.get("*",function(req, res, next){
  if (typeof req.session.key === 'undefined') {
    req.session.loggedIn = false;
    return next();
  }
  //get actual teamName here
  req.session.teamName = "Space Penguins";
  req.session.loggedIn = true;
  return next();
});

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
var raiseError = function(req,res,message){
  req.session.newError = true;
  req.session.errorMessage = message;
  res.redirect("/error");
}

app.get('/', function (req, res) {
  if(!req.session.loggedIn){
    loginMessage = "Not Logged In";
  }
  else{
    loginMessage = "Logged In"
  }
  res.render('index',{teamName:req.session.teamName});
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  var email = req.body.email;
  var key = req.body.key;
  currentUser = database.ref('/users/'+key);
  currentUser.on('value',function(data){
    if (data.val() == null){
      raiseError(req,res,"The key you provided does not match a team");
    }
    else if (data.val().email != email){
      raiseError(req,res,"The email you have entered is not registered");
    }
    else{
      req.session.key = key;
      res.redirect("/");
    }
  })
});
app.get('/team',function(req,res){
  //check if the user is logged in
  if(typeof req.session.key === "undefined"){
    raiseError(req,res,"You are not logged in");
    return;
  }
  else{
    //get team information
    key = req.session.key;
    outputs = [];
    currentFolderPath = path.join("game/outputs/"+req.session.key);
    fs.readdir(currentFolderPath,function(err,files){
      //read all the team outputs and add them to the team page as scripts
      files.map((filename)=>{
        outputs.push(JSON.parse(fs.readFileSync(path.join(currentFolderPath,filename),'utf8')));
      });
      jsonOutput = 'visualizationData='+JSON.stringify(outputs);
      //adding the information we got from the output files as scripts onto the /team page.
      //all the visualizer has to do is to refer to to the index of the variables

      //The page itself should also look at this information and create a score board thing.
      res.render("team",{output:jsonOutput,teamName:req.session.teamName,games:outputs});
    });
  }
});

app.post('/upload',function(req,res){
    if(typeof req.session.key === "undefined"){
      raiseError(req,res,"You are not logged in");
      return;
    }
    if (!req.files || req.files === {} || typeof req.files.file === "undefined"){
      //make this a page that you can reroute back to team?
      raiseError(req,res,"No file was uploaded");
      return;
    }
    //CHECK THE FILESIZE, FILETYPE
    var file = req.files.file;

    //write into the req.session.key/filename = which should be the current counter
    currentFolderPath = path.join("game/uploads/"+req.session.key)
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
            //remove those from /uploads
            function err_callback(err){
              if(err){
                raiseError(req,res,"There was an issue with storing the result of your submission");
                return;
              }
            }
            targetFiles.map((cur)=>{
              fs.unlink(path.join(currentFolderPath,cur+".py"),err_callback);
              outputPath = path.join("game/outputs/"+req.session.key);
              // and from /outputs
              fs.unlink(path.join(outputPath,cur+".js"),err_callback);
            });
          }
          //insta-FIFO!!!
          targetName = parseInt(Date.now());
          fs.writeFile(currentFolderPath+'/'+targetName+".py",file.data,(err)=>{
            if (err){
              raiseError(req,res,"There was an issue with storing the result of your submission");
              return;
            };
            res.redirect('/runCode?filename='+req.session.key+"/"+targetName);
          });
        });

      }
      else{
        raiseError(req,res,"There was an issue with storing the result of your submission");
      }
    });
});

app.get('/runCode',function(req,res){
  const { spawn } = require('child_process');
  // var process = spawn('python',['./uploads/'+req.query.filename+".py"]);
  var process = spawn('python',['./game/gameCore/gameMain.py']);
  //don't write the file here if the output isn't what we want!
  process.stdout.on('data', function(data){
  mkdirp(path.join(__dirname,'game/outputs/'+req.session.key), function(err) {
    fs.writeFile(path.join("game/outputs/",req.query.filename+".js"),data,(err)=>{
        if (err){
          //what is this function
          fileError();
        };
        res.redirect("/team");
      });
    })
  })
})
app.get('/rules',function(req,res){
  res.render('rules',{teamName:req.session.teamName})
})
app.get('/scoreboard',function(req,res){
  res.render('scoreboard',{teamName:req.session.teamName})
})
app.get('/error',function(req,res){
  if(req.session.newError){
    req.session.newError = false;
    res.render('error',{errMessage:req.session.errorMessage});
  }
  else{
    res.render('error',{errMessage:"Requested error page without any errors."});
  }
});

//if create/id, go to that id by retrieving it in the front end
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, function() {
  console.log(`Listening at ${PORT}`);
});
