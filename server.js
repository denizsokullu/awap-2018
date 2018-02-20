
//Make admin access only
//Create routes
//CHECK THE FILESIZE, FILETYPE of the upload
//figure out what fileError function is

/////////////////////////////
// Constants declared by AWAP

const MAX_UPLOAD = 2;

const EXEC_DEFAULTS = {
  encoding: 'utf8',
  timeout: 300000,
  maxBuffer: 512 * 1024,
  killSignal: 'SIGTERM',
  cwd: null,
  env: null
};

/////////////////////////////

const express = require('express');
const app = express();

//Parsing forms
const bodyParser = require('body-parser');
const mkdirp = require('mkdirp');

const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

const fs = require('fs');
const fileUpload = require('express-fileupload');


app.use(bodyParser.urlencoded({extended: true}));
//loading pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname,'./public')));

// app.use(require('morgan')('dev'));

var session = require('express-session');
var FileStore = require('session-file-store')(session);

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
//Admin Database Initializing
//The only place to access the database is via this admin access.
//All read/write access is disabled for any other users.
//requiring the module for the database API
const admin = require("firebase-admin");
//requiring the admin private key
const serviceAccount = require('./key/awap-2018-firebase-adminsdk-dch77-450875ac24.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://awap-2018.firebaseio.com"
});
db = admin.database();
//the admin has access to read and write all data, regardless of security rules
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

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
// /runCompetition?=password -> runs the tournament?(implement later)
//   grab a submission from each team
// /


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
  currentUser = db.ref('/users').child(key).child('emails');
  currentUser.on('value',function(data){
    if(!data.val()){
      res.redirect("/login");
      return;
    }
    emails = data.val();
    emailsArr = Object.keys(emails).map((key)=> {return emails[key]});
    if (emails == null){
      raiseError(req,res,"The key you provided does not match a team");
    }

    else if (!emailsArr.includes(email)){
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
        output = {}
        output.data = fs.readFileSync(path.join(currentFolderPath,filename),'utf8');
        output.filename = filename;
        outputs.push(output);
      });
      res.render("team",{teamName:req.session.teamName,games:outputs});

      //adding the information we got from the output files as scripts onto the /team page.
      //all the visualizer has to do is to refer to to the index of the variables

      //The page itself should also look at this information and create a score board thing.
    });
  }
});

app.get('/game',function(req,res){
  //check if the user is logged in
  if(typeof req.session.key === "undefined"){
    raiseError(req,res,"You are not logged in");
    return;
  }
  else{
    //get team information
    key = req.session.key;
    outputs = {};
    currentFolderPath = path.join("game/outputs/"+req.session.key);
    fs.readdir(currentFolderPath,function(err,files){
      //read all the team outputs and add them to the team page as scripts
      if(files){
        files.map((filename)=>{
          //simplify the file name here and in team
          outputs[filename] = JSON.parse(fs.readFileSync(path.join(currentFolderPath,filename),'utf8'));
        });
        jsonOutput = 'visualizationData='+JSON.stringify(outputs);
      }
      else{
        jsonOutput = 'visualizationData={}'
      }
      //adding the information we got from the output files as scripts onto the /team page.
      //all the visualizer has to do is to refer to to the index of the variables

      //The page itself should also look at this information and create a score board thing.
      res.render("visualization",{output:jsonOutput,teamName:req.session.teamName,games:outputs});
    });
  }
});

//connect
//remove oldest if more than MAX_UPLOAD
//run the code
//save the output to user -> timestamp

// db.ref('users').child("-KxeAKvtRTd1BJ5GwF7l").child('emails').set({
//   email1:"denizaydinsokullu@gmail.com",
//   email2:"dsokullu@andrew.cmu.edu",
//   email3:"",
//   email4:""
// })



app.post('/upload',(req,res)=>{

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
  var mapName = req.body.map;

  //write into the req.session.key/filename = which should be the current counter
  currentFolderPath = path.join("game/uploads/"+req.session.key)
  mkdirp(currentFolderPath,(err)=>{
    if(!err){

      //Check for MAX_UPLOAD of files
      fs.readdir(currentFolderPath,(err,files)=>{
        //max_upload limit has been reached, clean
        if(files.length >= MAX_UPLOAD){
          curFolder = files;
          targetFiles = [];
          while(curFolder.length >= MAX_UPLOAD){
            //add the filename that needs to be removed
            targetFiles.push(curFolder.splice(0,1)[0].split(".")[0]);
          }
          //remove those from /uploads
          function err_callback(err){
            if(err){
              console.log(err);
              return;
            }
          }
          outputPath = path.join("./game/outputs/"+req.session.key);
          targetFiles.map((cur)=>{
            fs.unlink(path.join(currentFolderPath,cur+".py"),err_callback);
            // and from /outputs
            fs.unlink(path.join(outputPath,cur+".js"),err_callback);
          });
        }
        targetName = parseInt(Date.now());
        fs.writeFile(currentFolderPath+'/'+targetName+".py",file.data,(err)=>{
          if (err){
            raiseError(req,res,"There was an issue with storing the result of your submission");
            return;
          };
          // const { spawn } = require('child_process');
          const { exec } = require('child_process');
          // var process = spawn('python',['./uploads/'+req.query.filename+".py"]);
          // var game = spawn('python3',['./game/gameCore/gameMain.py','player_ai_chris','player_ai_chris','player_ai_chris','player_ai_chris']);
          exec('python ./game/gameCore/gameMain.py player_one player_two player_two player_two ' + mapName, EXEC_DEFAULTS, (error,stdout,stderr)=>{
            //Error occured, delete file.
            if(error){
              console.log(`Error: ${error}`);
              //remove the uploaded file and redirect to /team with a message
              fs.unlink(path.join(currentFolderPath,targetName+".py"),err_callback);
              // res.redirect('/team');
              return;
            }
            //Python error occured, delete file.
            else if(stderr){
              console.log(`Stderr: ${stderr}`);
              //remove the uploaded file and redirect to /team with a message
              fs.unlink(path.join(currentFolderPath,targetName+".py"),err_callback);
              // res.redirect('/team');
              return;
            }
            //Code ran to completion without errors
            else{
              console.log(stdout);
              mkdirp(path.join(__dirname,'game/outputs/'+req.session.key),(err)=>{
                fs.writeFile(path.join("game/outputs/",req.session.key,targetName+".js"),stdout,(err)=>{
                  if(err){
                    raiseError(req,res,"There was an issue with storing the result of your submission");
                  }
                  // res.redirect('/team');
                  return
                });
              });
            }
          });
          res.redirect('/team')
        });
      });

    }
    else{
      raiseError(req,res,"There was an issue with storing the result of your submission");
    }
  });
});


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
