
const admin = require("firebase-admin");
//requiring the admin private key

const serviceAccount = require('./key/awap-2018-firebase-adminsdk-dch77-450875ac24.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://awap-2018.firebaseio.com"
});
//the admin has access to read and write all data, regardless of security rules
db = admin.database();

teamName = process.argv[2];

emails = process.argv.slice(3);

ref = db.ref('users');

emailObj = {};

for(var i = 0; i < emails.length; i++){
  key = `email${i+1}`;
  emailObj[key] = emails[i]
}

ref.push().set({
    emails:emailObj,
    teamName:teamName,
    publicScore:0
  },function(){
    process.exit();
  })
