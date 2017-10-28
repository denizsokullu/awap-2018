import React from 'react';
import ReactDOM from 'react-dom';
import {GalleryPiece,GalleryHeader} from './galleryPiece';
import * as comp from './galleryPiece';
import * as Firebase from 'firebase';

// const data = [
//   {id:"1",className:"projectBundle",title:"Generative Typewriter",paragraph:"An application where the user can create animated text by playing with the settings and can save them to view them later."},
//   {id:"2",className:"projectBundle",title:"Generative Posters",paragraph:"Wrote a script to generate posters using these 5 interesting things that blend in well together and printed them on 24x36"}
// ]

var config = {
  apiKey: "AIzaSyBgccrWZFk0uWNiys5_AIsd9msCJIaxSMg",
  authDomain: "computational-design.firebaseapp.com",
  databaseURL: "https://computational-design.firebaseio.com",
  projectId: "computational-design",
  storageBucket: "",
  messagingSenderId: "597250126920"
};

firebase.initializeApp(config);
var database = firebase.database();
var ref = database.ref('generativeTypewriter/creations');

document.addEventListener('DOMContentLoaded',function(){
  ref.on('value',createGallery);
});

function createGallery(data){
  var obj = data.val();
  var gallery = Object.keys(obj).map((cur,index)=>{
    //make this check stronger so that it actually checks data
    if (obj[cur].dataWrite){
      return <GalleryPiece     key={index}
                               id={obj[cur].id}
                               image={obj[cur].image}
                               title={obj[cur].title}
                               alt={obj[cur].title}
                               link={obj[cur].id}
                               jsonFile={obj[cur].id}/>;
    }
    return <p key={index}/>
  });
  ReactDOM.render(gallery,document.getElementById('gallery-container'),addListeners);
  ReactDOM.render(<GalleryHeader link="/generativeTypewriter/new" actionName="New"/>,document.getElementById('mainHeader'));
}
function addListeners(){
  $("#gallery-container .galleryPiece").each(function(){
    this.addEventListener("click",function(){
      var origin = window.location.origin;
      var currentProject = "/generativeTypewriter/create";
      var id = "?id="+this.id;
      window.location.replace(origin+currentProject+id);
    })
  });
}
