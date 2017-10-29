// import React from 'react';
//
// //Make a component that can take in names and descriptions
// //
//
// class ImageBlock extends React.Component{
//   render(){
//     return(
//       <img src={this.props.imageSRC} alt={this.props.alt}></img>
//     )
//   }
// };
// class GalleryButton extends React.Component{
//   render(){
//     return(
//       <a href={this.props.link}><button>{this.props.actionName}</button></a>
//     )
//   }
// };
//
// class GalleryTitle extends React.Component{
//   render(){
//     return(
//       <h4>{this.props.title}</h4>
//     )
//   }
// };
//
// class GalleryPiece extends React.Component{
//   //className
//   //id
//   //image
//   //alt
//   //link
//   //jsonFile
//   render(){
//     return(
//       <div className="galleryPiece" id={this.props.id}>
//         <ImageBlock imageSRC={this.props.image} alt={this.props.title}/>
//         <GalleryTitle title={this.props.title}/>
//         <div className="button-container">
//           <GalleryButton link={this.props.link} actionName="Visit"/>
//           <GalleryButton link={this.props.jsonFile} actionName="Download"/>
//         </div>
//       </div>
//     )
//   }
// };
// class GalleryHeader extends React.Component{
//   render(){
//     return(
//       <div>
//         <h1>Gallery</h1>
//         <GalleryButton link={this.props.link} actionName={this.props.actionName}/>
//       </div>
//     )
//   }
// };
// module.exports = {GalleryPiece,GalleryHeader};
