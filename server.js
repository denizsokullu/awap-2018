/////////////////////////////
// Constants declared by AWAP
const __adminPW = 'strongMango1453'
const MAX_UPLOAD_PRIVATE = 4;
const MAX_UPLOAD_PUBLIC = 1;
const MAX_UPLOAD_COMP = 1;

const EXEC_DEFAULTS = {
  encoding: 'utf8',
  timeout: 360000,
  maxBuffer: 1024 * 1024,
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

const session = require('express-session');
const redis   = require("redis");
const redisStore = require('connect-redis')(session);

var client;
if (process.env.REDISTOGO_URL) {
    redisURL = url.parse(process.env.REDISTOGO_URL);
    client = redis.createClient(redisURL.port, redisURL.hostname);
    client.auth(redisURL.auth.split(":")[1]);
} else {
    client = redis.createClient();
}

app.use(bodyParser.urlencoded({extended: true}));
//loading pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname,'./public')));


// var session = require('express-session');
var FileStore = require('session-file-store')(session);

app.use(session({
  name: 'Session Storage',
  secret: 'password',
  saveUninitialized: true,
  resave: true,
  store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 260})
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
    console.log(allScores);
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
    res.redirect('/login')
    return;
  }
  if(type == 'competition'){
    outputs = {};
    key = req.session.key;
    currentRound = parseInt(req.query.round);
    fs.readdir('game/submissions/competition/results',function(err,files){
      if(files && files.length > 0){
        //filter out the ones that aren't this round
        files = files.filter(curFile=>{
          return parseInt(curFile.split('-')[0]) == currentRound
        });
        if(files.length == 0){
          jsonOutput = 'visualizationData={}';
          res.render("visualization",{output:jsonOutput});
          return
        }
        const promises = files.map(filename => {
          return new Promise((resolve, reject) => {
            getTeamNames(filename.split('.')[0],function(data){
              try {
                  if(data.found){
                    output = JSON.parse(fs.readFileSync(`game/submissions/competition/results/${filename}`,'utf8'));
                    output.teamNames = data.teamNames
                    output.type = 'competition'
                    gameName = `Round-${filename.split('-')[0]} Game-${filename.split('.')[0].split('-')[1]}`
                    outputs[gameName] = output;
                  }
              }
              catch(err) {
              }
              resolve();
            })
          });
        });

        Promise.all(promises).then(_ => {
            // call the running script here
            // console.log(outputs);
            jsonOutput = 'visualizationData='+JSON.stringify(outputs);
            data = {output:jsonOutput,teamNames:{},games:outputs}
            res.render("visualization",data);
        }).catch(err => {
            // handle I/O error
            console.error(err);
        });
      }
      else{
        jsonOutput = 'visualizationData={}';
        res.render("visualization",{output:jsonOutput});
      }
    })
  }
  else if(type == 'private'){
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
            res.render("visualization",{output:jsonOutput,teamName:req.session.teamName,games:outputs,
              teamNames:{}
            });
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
        foundOutput = false
        outputFilename = '';
        for(var file in folders){
          file = folders[file];
          // console.log(file)
          if(file.includes('.js')){
            foundOutput = true;
            outputFilename = file;
            try {
                fs.readFile(`${teamPath}/${outputFilename}`,'utf8',(err,data)=>{
                    filename = outputFilename.split('.')[0]
                    outputs[filename] = JSON.parse(data);
                    jsonOutput = 'visualizationData='+JSON.stringify(outputs);
                    getPublicIndex(key,function(index){
                      // console.log(index);
                      if(index == null){
                        res.render("visualization",{output:jsonOutput,teamName:req.session.teamName,games:outputs});
                      }
                      else{
                        teamNames = {};
                        indexKey = `team${index}`;
                        // console.log(req.session.teamName);
                        teamNames[indexKey] = req.session.teamName;
                        res.render("visualization",{output:jsonOutput,teamName:req.session.teamName,games:outputs,teamNames:teamNames});
                      }
                    })
                  return;
                });
            }
            catch(err) {
            }
          }
        }
        if(!foundOutput){
          jsonOutput = 'visualizationData={}';
          res.render("visualization",{output:jsonOutput,teamName:req.session.teamName,games:outputs});
          return;
        }
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

app.get('/getSubmissions',(req,res)=>{
  if(req.query.key != __adminPW){
    res.send(`Incorrect key! Please don't mess around with the admin api!`);
  }
  else{
    var zipdir = require('zip-dir');
    filename = 'submissions.zip';
    zipdir('game/submissions', { saveTo: filename }, function (err, buffer) {
      var filePath = path.join(__dirname, filename);
      var stat = fs.statSync(filePath);
      res.writeHead(200, {
          'Content-Type': 'application/zip',
          'Content-Length': stat.size,
          'Content-Disposition': "attachment; filename=\"" + filename +"\""
      });
      var readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });
  }
});

app.get('/uploadSubmissions',(req,res)=>{
  if(req.query.key != __adminPW){
    res.send(`Incorrect key! Please don't mess around with the admin api!`);
  }
  else{
    res.render('uploadSubmissions');
  }
});

app.post('/uploadSubmissions',(req,res)=>{
  if(req.query.key != __adminPW){
    res.send(`Incorrect key! Please don't mess around with the admin api!`);
  }
  else if(!req.files.submissions){
    res.send(`Didn't upload a file!`);
  }
  else{
    filename = 'submissionsNew.zip';
    const output = fs.createWriteStream(filename);
    const input = new Duplex();
    // console.log(req.files.submissions)
    input.push(req.files.submissions.data);
    input.push(null);
    input.pipe(output);
    output.on('error', function(){
      res.send('upload went wrong gg')
    });
    input.on('error', function(){
      res.send('upload went wrong gg')
    });
    input.on('end', function(){
      var decompress = require('decompress');
      decompress(filename, 'game/submissions').then(files => {
          console.log('done!');
      });
      res.send('success');
    });
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
          file[filename] = { status: hasOutput ? 'Completed' : 'In progress'}
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

//input: gameNum ex. 3-01(round 3 game 1)
//output: {players:array of teamIDs,found:bool if team found}

function getTeamNames(gameNum,callback){
  ref = db.ref('competitionMapping').child(gameNum);
  users = db.ref('users');
  ref.once('value',function(data){
    players = data.val();
    if(players){
      teamNames = {};
      users.once('value',function(data){
        usersDB = data.val();
        Object.keys(players).map(key=>{
          playerNum = parseInt(key) + 1;
          teamNames[`team${playerNum}`] = usersDB[players[key]].teamName
        })
        // console.log(teamNames);
        callback({teamNames:teamNames,found:true});
      })
    }
  });
}

function updatePublicIndex(teamID,index){
    db.ref('users').child(teamID).update({publicIndex:index});
}

function getPublicIndex(teamID,callback){
  db.ref('users').child(teamID).child('publicIndex').once('value',function(data){
    if(data.val() == null){
      callback(null);
    }
    else{
      callback(data.val());
    }
  });
}

function handleUpload(req,res,settings){

  if(typeof req.session.key === "undefined"){
    res.redirect('/login')
    return;
  }

  //Checks to make sure that the files are uploaded.
  if (!req.files || req.files === {}){
    //make this a page that you can reroute back to team?
    res.redirect('/')
    return;
  }
  if(settings.check && !settings.check()){
    res.redirect('/')
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
                runGame(execPath,folderPath,mapName,gameID,files,-1,teamID,res,function(score,failed){
                  // res.redirect('/');
                });
            }
            else if(settings.isPublic){
              fillMatch(teamID,function(playerPool,teamIndex){
                runGame('submissions/public',gamesPath,mapName,gameID,playerPool,teamIndex,teamID,res,function(score,failed){
                  if(!failed){
                    updateScore(teamID,parseInt(score));
                  }

                });
              })
            }
            else if(settings.isCompetition){
              // res.redirect('/')
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
  playerPool = [];
  playersNeeded = 4;
  playerPoolFiles = ['','','',''];
  fs.readdir(publicPath,function(err,teams){
    teams = teams.filter(teamName=>{
      return teamName != 'ignore.txt'
    })
    if(teams){
      numTeams = teams.length;
      for(var i = 0; i < playersNeeded; i++){
        randomIndex = parseInt(Math.random() * numTeams);
        randomPlayerId = teams[randomIndex];
        playerPool.push(randomPlayerId);
      }

      //pick a random index, replace that with the teamID;
      teamIndex = parseInt(Math.random() * playersNeeded);
      playerPool[teamIndex] = teamID;

      const promises = playerPool.map((player,index) => {
        return new Promise((resolve, reject) => {
          fs.readdir(`${publicPath}/${player}`,function(err,files){
              //the folder name and the output filename are the sam
              if(files){
                files.map(file=>{
                  if(file.toLowerCase().includes('.py')){
                    filename = file.split('.')[0];
                    playerPoolFiles[index] = `${player}.${filename}`;
                  }
                })
              }
              resolve()
          });
        });
      });

      Promise.all(promises).then(_ => {
        // console.log(playerPool,playerPoolFiles);
        callback(playerPoolFiles,teamIndex)
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

function updateScore(teamID,score){
  // console.log(score);
  db.ref('users').child(teamID).update({publicScore:score});
}

function runGame(execPath,folderPath,mapName,outputName,files,teamIndex,teamID,res,callback){
  const { exec } = require('child_process');
  dotPath = execPath.replace(/\//g,'.');
  console.log(files,teamIndex,teamID,mapName)
  files = files.map(player=>{
    return `${dotPath}.${player}`
  })
  // console.log(files);
  exec(`python game/gameMain.py ${files.join(' ')} ${mapName}`, EXEC_DEFAULTS, (error,stdout,stderr)=>{
    if(error){
      console.log(`Error: ${error}`);
      //remove the uploaded file and redirect to /team with a message
      rimraf(folderPath,()=>{
        // callback(0,true)
      })
      return;
    }
    //Python error occured, delete file.
    else if(stderr){
      console.log('error')
      rimraf(folderPath,()=>{
        // callback(0,true)
      })
      return;
    }
    //Code ran to completion without errors
    else{
      score = 0;
      if(teamIndex != -1){
        data = JSON.parse(stdout);
        lastRound = data.state.length - 1;
        // console.log(data.state[lastRound],teamIndex+1);
        updatePublicIndex(teamID,teamIndex+1);
        score = data.state[lastRound][teamIndex+1].score;
      }
      callback(score,false);
      console.log(`${folderPath}/${outputName}.js`);
      fs.writeFile(`${folderPath}/${outputName}.js`,stdout,(err)=>{
        if(err){
          rimraf(folderPath,()=>{
            // res.redirect('/');
          });
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
    // console.log(submissionDeadline);
    function submissionCheck(){
      console.log(gameID <= submissionDeadline,gameID,submissionDeadline)
      return gameID <= parseInt(submissionDeadline)
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
