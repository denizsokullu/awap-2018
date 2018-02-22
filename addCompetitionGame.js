const admin = require("firebase-admin");
//requiring the admin private key
const serviceAccount = require('./key/awap-2018-firebase-adminsdk-dch77-450875ac24.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://awap-2018.firebaseio.com"
});
//the admin has access to read and write all data, regardless of security rules
db = admin.database();

gameNum = process.argv[2];

players = process.argv.slice(3);

ref = db.ref('competitionMapping');

ref.once('value',function(data){
  if(data.val()){
    mappings = data.val();
  }
  else{
    mappings = {};
  }
  mappings[gameNum] = players;
  ref.set(mappings,function(){
    console.log(mappings[gameNum]);
    process.exit();
  });
})
