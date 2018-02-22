
const admin = require("firebase-admin");
//requiring the admin private key

const serviceAccount = require('./key/awap-2018-firebase-adminsdk-dch77-450875ac24.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://awap-2018.firebaseio.com"
});
//the admin has access to read and write all data, regardless of security rules
db = admin.database();

ref = db.ref('users');

teams = {};

ref.once('value',function(data){
  users = data.val();
  Object.keys(users).map(key=>{
    teams[key] = Object.keys(users[key].emails).map(function(emailNum){
      return users[key].emails[emailNum]
    });
    teams[key] = teams[key].join(', ');
  })
  Object.keys(teams).map(function(teamKey){
    console.log(teamKey,teams[teamKey]);
  })
  process.exit();
})
