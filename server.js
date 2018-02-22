/////////////////////////////
// Constants declared by AWAP
const __adminPW = 'strongMango1453'
const MAX_UPLOAD_PRIVATE = 4;
const MAX_UPLOAD_PUBLIC = 1;
const MAX_UPLOAD_COMP = 1;

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

const rimraf = require('rimraf');
const Duplex = require('stream').Duplex;

app.use(bodyParser.urlencoded({extended: true}));
//loading pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname,'./public')));


var session = require('express-session');
var FileStore = require('session-file-store')(session);

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));

app.use(fileUpload());

app.get("*",function(req, res, next){
  if (typeof req.session.key === 'undefined') {
    req.session.loggedIn = false;
    return next();
  }
  //get actual teamName here
  req.session.loggedIn = true;
  return next();
});

const admin = require("firebase-admin");
//requiring the admin private key
const serviceAccount = require('./key/awap-2018-firebase-adminsdk-dch77-450875ac24.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://awap-2018.firebaseio.com"
});
//the admin has access to read and write all data, regardless of security rules
db = admin.database();

var raiseError = function(req,res,message){
  req.session.errorMessage = message;
  res.redirect("/error");
}

// db.ref('users').child("-KxeAKvtRTd1BJ5GwF7l").child('emails').set({
//   email1:"denizaydinsokullu@gmail.com",
//   email2:"dsokullu@andrew.cmu.edu",
//   email3:"",
//   email4:""
// })

// db.ref('users').push().set({
//     emails:{
//       email1:"denizaydinsokullu@gmail.com",
//       email2:"dsokullu@andrew.cmu.edu",
//       email3:"",
//       email4:""
//     },
//     teamName:'Space Penguins',
//     publicScore:45
//   });

app.get('/', function (req, res) {
  if(!req.session.loggedIn){
    res.redirect('login');
    return;
  }
  res.render('index',{teamName:req.session.teamName});
});

app.get('/leaderboard', function(req,res){
  allScores = [];
  db.ref('users').once('value',function(data){
    users = data.val();
    Object.keys(users).map((user)=>{
      if(users[user].publicScore){
        if(user == req.session.key){
          allScores.push({score:users[user].publicScore,highlight:true})
        }
        else{
          allScores.push({score:users[user].publicScore,highlight:false})
        }
      }
    })
    allScores.sort(function(obj1,obj2){
      return parseInt(obj2.score) - parseInt(obj1.score);
    })
    res.render('leaderboard',allScores);
  })
})

app.get('/logout',function(req,res){
  req.session.key = undefined;
  res.redirect('/');
})

app.use('/login',require('./routes/auth'));

app.get('/game',function(req,res){
  type = req.query.type
  //check if the user is logged in
  if(typeof req.session.key === "undefined"){
    raiseError(req,res,"You are not logged in");
    return;
  }
  if(type == 'private'){
    //get team information
    key = req.session.key;
    outputs = {};
    teamPath = `game/submissions/private/${req.session.key}`;
    fs.readdir(teamPath,function(err,folders){
      //read all the team outputs and add them to the team page as scripts
      if(typeof folders === 'object' && folders.length != 0){

        const promises = folders.map(folder => {
          return new Promise((resolve, reject) => {
            fs.readdir(`${teamPath}/${folder}`,function(err,game){
                //the folder name and the output filename are the same
                try {
                    outputs[folder] = JSON.parse(fs.readFileSync(`${teamPath}/${folder}/${folder}.js`,'utf8'));
                }
                catch(err) {
                }
                resolve();
            });
          });
        });

        Promise.all(promises).then(_ => {
            // call the running script here
            // console.log(outputs);
            jsonOutput = 'visualizationData='+JSON.stringify(outputs);
            res.render("visualization",{output:jsonOutput,teamName:req.session.teamName,games:outputs});
        }).catch(err => {
            // handle I/O error
            console.error(err);
        });
      }
      else{
        jsonOutput = 'visualizationData={}';
        res.render("visualization",{output:jsonOutput,teamName:req.session.teamName,games:outputs});
      }
      //adding the information we got from the output files as scripts onto the /team page.
      //all the visualizer has to do is to refer to to the index of the variables

      //The page itself should also look at this information and create a score board thing.
    });
  }
  else if(type == 'public'){
    //get team information
    key = req.session.key;
    outputs = {};
    teamPath = `game/submissions/public/${req.session.key}`;
    fs.readdir(teamPath,function(err,folders){
      //read all the team outputs and add them to the team page as scripts
      if(typeof folders === 'object' && folders.length != 0){
          folders.map(file=>{
            if(file.includes('.js')){
              try {
                  fs.readFile(`${teamPath}/${file}`,'utf8',(err,data)=>{
                    filename = file.split('.')[0]
                    outputs[filename] = JSON.parse(data);
                    jsonOutput = 'visualizationData='+JSON.stringify(outputs);
                    res.render("visualization",{output:jsonOutput,teamName:req.session.teamName,games:outputs});
                  });
              }
              catch(err) {
              }
            }
          });
      }
      else{
        jsonOutput = 'visualizationData={}';
        res.render("visualization",{output:jsonOutput,teamName:req.session.teamName,games:outputs});
      }
    });
  }
});

app.get('/setSubmissionDeadline',(req,res)=>{
  if(req.query.key != __adminPW){
    res.send(`Incorrect key! Please don't mess around with the admin api!`);
  }
  else{
    db.ref('submissionDeadline').set({time:req.query.time});
    time = new Date(parseInt(req.query.time));
    res.send(`Submission deadline set to ${time}`);
  }
});

app.get('/submissionDeadline',(req,res)=>{
    db.ref('submissionDeadline').once('value',(data)=>{
      seconds = data.val().time
      time = new Date(parseInt(seconds));
      res.send(`Submission deadline is ${time}`);
    });
});

app.post('/submissions/:type',(req,res)=>{
  if(typeof req.session.key === "undefined"){
    res.json({success:false})
    return;
  }

  userID = req.session.key;
  type = req.params.type;

  if(type == 'private'){
    folderPath = `game/submissions/private/${userID}`;
  }
  else if(type == 'public'){
    folderPath = `game/submissions/public/${userID}`;
  }
  else if(type == 'competition'){
    folderPath = `game/submissions/competition/${userID}`;
  }
  fs.readdir(folderPath,function(err,folders){
    submissions = {}
    //read all the team outputs and add them to the team page as scripts
    if(typeof folders === 'object' && folders.length != 0){
      if(type == 'competition' || type == 'public'){
        // console.log(folders);
        hasOutput = false;
        hasInput = false;
        folders.map(folder=>{
          if(folder.includes('.py')){
            hasInput = true;
            filename = folder.split('.')[0];
          }
          if(folder.includes('.js')){
            hasOutput = true;
            filename = folder.split('.')[0];
          }
        })
        if(hasInput || hasOutput){
          file = {};
          file[filename] = { status: hasOutput ? 'Completed' : 'Uploaded'}
          res.json({success:true,
                    submissions:file})
        }
        else{
          res.json({success:false})
        }
        return
      }
      else{
        const promises = folders.map(folder => {
          return new Promise((resolve, reject) => {
            fs.readdir(`${folderPath}/${folder}`,function(err,files){
                //the folder name and the output filename are the sam
                if(files){
                  if(files.includes(`${folder}.js`)){
                    submissions[folder] = {status:'Completed'}
                  }
                  else{
                    submissions[folder] = {status:'In progress'}
                  }
                }
                else{
                  submissions = {}
                }
                resolve()
            });
          });
        });

        Promise.all(promises).then(_ => {
          res.json({success:true,
                    submissions:submissions});
        }).catch(err => {
            // handle I/O error
            console.error(err);
            res.json({success:false});
        });
      }
    }
    else{
      res.json({success:false})
    }
  });
})


function handleUpload(req,res,settings){

  if(typeof req.session.key === "undefined"){
    raiseError(req,res,"You are not logged in");
    return;
  }

  //Checks to make sure that the files are uploaded.
  if (!req.files || req.files === {}){
    //make this a page that you can reroute back to team?
    raiseError(req,res,"No file was uploaded");
    return;
  }

  if(settings.check && !settings.check()){
    raiseError(req,res,"Past submission deadline");
    return;
  }

  //private/teamID/gameID(this is a timestamp)/uploads/ UPLOAD FILE HERE
  //private/teamID/gameID(this is a timestamp)/outputs/ OUTPUT FILE HERE

  //competition/uploads/teamID/UPLOADED FILE HERE
  //competition/outputs/gameID(these games are named differently)/ OUTPUT FILE HERE

  objectNames = settings.objectNames;

  //Add up the number of files and the number of string inputs
  //to make sure there are 4 players.

  fileCount = Object.keys(req.files).length;
  stringCount = 0;
  objectNames.map(playerName => {
    if(req.body[playerName]){
      stringCount += 1;
    }
  })

  //If not 4, return immediately.
  if(fileCount + stringCount != objectNames.length){
    raiseError(req,res,"One of the players did not get any player code.");
    return;
  }

  //gameID
  gameID = settings.gameID;

  //team ID
  teamID = req.session.key;

  //path for the game
  corePath = settings.corePath;

  gamesPath = `game/${corePath}`;
  folderPath = `${gamesPath}${settings.gamePath}`;
  uploadPath = `${folderPath}${settings.uploadPath}`;
  execPath = `${corePath}${settings.gamePath}${settings.uploadPath}`;

  //map name
  mapName = req.body.map;

  cleanGames(gamesPath,settings.threshold,()=>{

    //Done cleaning

    mkdirp(uploadPath,(err)=>{
      if(!err){
        const promises = objectNames.map(file => {
            if(settings.isCompetition || settings.isPublic){
              targetFile = `${uploadPath}/${gameID}.py`;
            }
            else{
              targetFile = `${uploadPath}/${file}.py`;
            }

            //If the user has uploaded a file for this player,
            //read the uploaded file and load it into
            //the uploads folder for that game.
            if(req.files[file]){
              return writeFile(req.files[file].data, targetFile, false);
            }

            //If the user specified a builtin bot filename instead,
            //load that file into that uploads directory of the game.

            else{
              return writeFile(undefined, targetFile, true, `game/bots/${req.body[file]}.py`);
            }
        });

        Promise.all(promises).then(_ => {
            // call the running script here
            if(settings.isPrivate){
                files = ['player1','player2','player3','player4']
                runGame(execPath,folderPath,mapName,gameID,files);
            }
            else if(settings.isPublic){
              fillMatch(teamID,function(playerPool){
                runGame('submissions/public',gamesPath,mapName,gameID,playerPool);
              })
            }
            else if(settings.isCompetition){

            }
            res.redirect('/');
        }).catch(err => {
            // handle I/O error
            console.error(err);
            res.redirect('/');
        });
      }
      else{
        raiseError(req,res,"Failed while saving your upload.");
      }
    })
  });
}

function fillMatch(teamID,callback){
  //fills the upload directory with 3 more player codes.
  publicPath = 'game/submissions/public'
  playerPool = [teamID];
  playersNeeded = 3;
  playerPoolFiles = [];
  fs.readdir(publicPath,function(err,teams){
    if(teams){
      numTeams = teams.length;
      for(var i = 0; i < playersNeeded; i++){
        randomIndex = parseInt(Math.random() * numTeams);
        randomPlayerId = teams[randomIndex];
        playerPool.push(randomPlayerId);
      }
      const promises = playerPool.map(player => {
        return new Promise((resolve, reject) => {
          fs.readdir(`${publicPath}/${player}`,function(err,files){
              //the folder name and the output filename are the sam
              if(files){
                files.map(file=>{
                  if(file.toLowerCase().includes('.py')){
                    filename = file.split('.')[0];
                    playerPoolFiles.push(`${player}.${filename}`);
                  }
                })
              }
              resolve()
          });
        });
      });

      Promise.all(promises).then(_ => {
        callback(playerPoolFiles)
      }).catch(err => {
          // handle I/O error
          console.error(err);
          callback([]);
      });

    }
  })
}

function cleanGames(folderPath,threshold,callback){

 fs.readdir(folderPath,(err,files)=>{
   if(!files){
     callback();
     return;
   }
   //max_upload limit has been reached, clean
   else if(files.length >= threshold){
     games = files;
     targetFiles = [];
     while(games.length >= threshold){
       //add the filename that needs to be removed
       targetFiles.push(games.splice(0,1)[0]);
     }

     //remove those from /uploads
     function err_callback(err){
       if(err){
         console.log(err);
         return;
       }
     }
     targetFiles.map((gameID)=>{ rimraf(`${folderPath}/${gameID}`,err_callback)});
   }
   callback();
 })
}

function writeFile(data, dest, isBot, botPath) {

  const output = fs.createWriteStream(dest);
  let input;
  if(isBot){
    input = fs.createReadStream(botPath);
  }
  else{
    input = new Duplex();
    input.push(data);
    input.push(null);
  }

  return new Promise((resolve, reject) => {
      output.on('error', reject);
      input.on('error', reject);
      input.on('end', resolve);
      input.pipe(output);
  });
}

function runGame(execPath,folderPath,mapName,outputName,files){
  const { exec } = require('child_process');
  dotPath = execPath.replace(/\//g,'.');
  files = files.map(player=>{
    return `${dotPath}.${player}`
  })
  exec(`python game/gameMain.py ${files.join(' ')} ${mapName}`, EXEC_DEFAULTS, (error,stdout,stderr)=>{
    if(error){
      // console.log(`Error: ${error}`);
      //remove the uploaded file and redirect to /team with a message
      rimraf(folderPath,()=>{
        res.redirect('/team');
      })
      return;
    }
    //Python error occured, delete file.
    else if(stderr){
      rimraf(folderPath,()=>{
        res.redirect('/team');
      })
      return;
    }
    //Code ran to completion without errors
    else{
      fs.writeFile(`${folderPath}/${outputName}.js`,stdout,(err)=>{
        if(err){
          rimraf(folderPath,()=>{});
        }
      });
    }
  })
}

app.post('/uploadPrivate',(req,res)=>{
  gameID = parseInt(Date.now())
  __upload_private_settings = {
    objectNames:['player1','player2','player3','player4'],
    corePath:`submissions/private/${req.session.key}`,
    gamePath:`/${gameID}`,
    uploadPath:`/uploads`,
    threshold:MAX_UPLOAD_PRIVATE,
    gameID:gameID,
    isPrivate:true,
    isPublic:false,
    isCompetition:false
  }
  handleUpload(req,res,__upload_private_settings);

});

app.post('/uploadPublic',(req,res)=>{
  gameID = parseInt(Date.now())
  __upload_public_settings = {
    objectNames:['player1'],
    corePath:`submissions/public/${req.session.key}`,
    gamePath:``,
    uploadPath:``,
    gameID:gameID,
    threshold:MAX_UPLOAD_PUBLIC,
    isPrivate:false,
    isPublic:true,
    isCompetition:false
  }
  handleUpload(req,res,__upload_public_settings)
});

app.post('/uploadCompetition',(req,res)=>{

  gameID = parseInt(Date.now());
  db.ref('submissionDeadline').once('value',(data) =>{
    //this is Feb 24, 5:30:00pm
    submissionDeadline = data.val().time;
    console.log(submissionDeadline);
    function submissionCheck(){
      return gameID <= submissionDeadline
    }
    __upload_comp_settings = {
      objectNames:['player1'],
      corePath:`submissions/competition/${req.session.key}`,
      gamePath:``,
      uploadPath:``,
      gameID:gameID,
      check:submissionCheck,
      threshold:MAX_UPLOAD_COMP,
      isPrivate:false,
      isPublic:false,
      isCompetition:true
    }
    handleUpload(req,res,__upload_comp_settings)
  })
});

app.get('/error',function(req,res){
  if(!req.session.errorMessage.length == 0){
    res.render('error',{errMessage:req.session.errorMessage});
    req.session.errorMessage = '';
    return
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
