module.exports = (function(){

  const router = require('express').Router();

  // const debug = require('debug')('routes/account');
  // const connectEnsure = require('connect-ensure-login');
  // const connect = require('../../lib/db/connect').connect;
  // const database = connect("accountRoutes");
  // const Exchange = require('../../lib/trade/trade');
  // const accountAccess = require('../../lib/currency/access');
  // const users = require('../../lib/db').users;

  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  //Admin Database Initializing
  //The only place to access the database is via this admin access.
  //All read/write access is disabled for any other users.
  //requiring the module for the database API
  const admin = require("firebase-admin");
  //requiring the admin private key
  const serviceAccount = require('./../../key/awap-2018-firebase-adminsdk-dch77-450875ac24.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://awap-2018.firebaseio.com"
  },'auth');
  db = admin.database();
  //the admin has access to read and write all data, regardless of security rules
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////

  router.get('/', function (req, res) {
    res.render('login');
  });

  router.post('/', function(req, res) {
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    var email = req.body.email;
    var key = req.body.key;

    currentUser = db.ref('/users').child(key).child('emails');
    currentUser.once('value',function(data){
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
        teamData = db.ref('/users').child(key);
        teamData.once('value',function(data){
          content = data.val()
          if(!content){
            req.session.teamName = 'Team Name Not Found'
          }
          else{
            req.session.teamName = content.teamName;
          }
        })
        req.session.key = key;
        res.redirect("/");
      }
    })
  });
  return router;
})();
