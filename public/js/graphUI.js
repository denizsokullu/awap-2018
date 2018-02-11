__zoom = {
  amount:.1,
  limitLow: 0.2,
  limitHigh: 5
}

__settings = {
  turnSpeed:1000,
  turns:100,
  nodeCount:100,
  playerCount:4
}

var __graph;
var timeline;
var progress;
var currentGameplay;

// 100 len array of timelines

// each timeline only has one element in it

// timing affects All

// playing/pausing/restarting affects all

function createParallelTimeline(state,progress){
  timeline = {};
  //there should be a blank timeline that controls the progress bar
  for(var i = 0; i < __settings.nodeCount; i++){
    if(i == 0){
      nodeTimeline = anime.timeline({
        easing: 'linear',
        autoplay: false,
        update:function(anim){
          progress.val(anim.progress);
          $('.progress-counter .change').text(parseInt(anim.progress));
        }
      });
    }
    else{
      nodeTimeline = anime.timeline({
        easing: 'linear',
        autoplay: false,
      });
    }
    timeline["node-"+i] = nodeTimeline;
  }



  $(document).ready(function(){

    turnOffset = 0;
    state.map((actions,turn)=>{
        Object.keys(actions).map((player)=>{
            turnOffset = (__settings.turnSpeed * 4 * turn) + ((parseInt(player) - 1 ) * __settings.turnSpeed);
            //moves
            changedNodes = new Set();

            moves = actions[player].moves;
            moves.map((action,index)=>{
              changedNodes.add(action[0]);
              changedNodes.add(action[1]);
              __graph.updateNode(action[0],player,-action[2]);
              __graph.updateNode(action[1],player,action[2]);
            })
            placement = actions[player].placement;
            placement.map((action)=>{
              changedNodes.add(action[0]);
              __graph.updateNode(action[0],player,action[1]);
            });
            changedNodes.forEach(function(node){
              __graph.animateNode(node,timeline,turnOffset)
            })
        });
        $('.loaded-turns .change').text(parseInt(turn + 1));
    });
    //pad all the animations to totalTime
    Object.keys(timeline).map((t)=>{
      totalTime = __settings.turnSpeed *
                  __settings.turns *
                  __settings.playerCount;
      if(timeline[t].duration != totalTime){
        //add a fake animation;
        timeline[t].add({
          targets:'body',
          scale:1,
          duration:totalTime - timeline[t].duration,
          offset:timeline[t].duration
        });
      }
      timeline[t].seek(0);
    })
    $('#loading').addClass('hidden');
  })

}

function loadGraph(g){

  __graph = createGraph(g.board);

  __settings.nodeCount = Object.keys(g.board).length;
  __settings.playerCount = Object.keys(g.state[0]).length;
  __settings.turns = g.state.length;

  //Slider controls
  var progress = $('.progress');

  progress.off('input');
  progress.on('input',function(){
    $('.ui-bottom-bar .pause').click();
    Object.keys(timeline).map((t)=>{
      timeline[t].seek(timeline[t].duration * (progress.val() / 100));
    })
    $('.progress-counter .change').text(parseInt(progress.val()));
  })

  createParallelTimeline(g.state,progress);
}

function loadRunAnimationListener(){
  $(".run-animation").click(function(){
    //Hide the message
    $('#intro-message').addClass('hidden');
    $('#loading').removeClass('hidden');

    if(visualizationData.length == 0){
      return;
    }
    //Clear the map
    removeGraph();
    //Find the filename
    filename = $(".dropdown select").val();
    g = visualizationData[filename].board
    //Load the graph
    loadGraph(visualizationData[filename]);
  })
}

function loadControls(){

  // Handle Graph Dragging
  $('#graph-container').draggable();

  // Handle Graph Zoom
  $('#zoom-reset').click(function(){resetZoom()});
  $('#zoom-in').click(function(){graphZoom(+__zoom.amount)});
  $('#zoom-out').click(function(){graphZoom(-__zoom.amount)});

  //Button Controls
  $('.ui-bottom-bar .play').click(()=>{Object.keys(timeline).map((t)=>{timeline[t].play()})});
  $('.ui-bottom-bar .pause').click(()=>{Object.keys(timeline).map((t)=>{timeline[t].pause()})});
  $('.ui-bottom-bar .restart').click(()=>{Object.keys(timeline).map((t)=>{timeline[t].restart()})});

}

function removeGraph(){

  __graph = {};
  timeline = {};
  $('.progress-counter .change').text("0").val(0);
  $('#nodes *, #edges-container, #players *').remove();

}

async function delayedLog(item){
  await delay();
  console.log(item)
}

async function processArray(array){
  for(const item of array){
    await delayedLog(item)
  }
}

function resetZoom(){
  $('#graph-container').css('transform','scale(1,1)');
}

function graphZoom(amount){
  curScale = parseFloat($("#graph-container").css('transform').split(',')[3]);
  if(!curScale){
    curScale = 1;
  }
  newScale = curScale + amount;
  if(curScale < __zoom.limitHigh){
    $('#graph-container').css('transform','scale('+ newScale + ","+ newScale +')');
  }
}

$(document).ready(function(){

  loadControls();

  loadRunAnimationListener();

})
