var config = {
  apiKey: "AIzaSyBgccrWZFk0uWNiys5_AIsd9msCJIaxSMg",
  authDomain: "computational-design.firebaseapp.com",
  databaseURL: "https://computational-design.firebaseio.com",
  projectId: "computational-design",
  storageBucket: "",
  messagingSenderId: "597250126920"
};
firebase.initializeApp(config);
console.log(firebase);
var database = firebase.database();
var ref = database.ref('generativeTypewriter/creations');
