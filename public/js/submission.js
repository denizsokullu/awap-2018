$(window).ready(function(){
  $('.private,.competition,.public').click(function(){
    console.log($(this));
    if(!$(this).hasClass('selected')){
      $('.private,.competition,.public').removeClass('selected');
      $(this).addClass('selected');
      formType = $(this).attr('class').split(' ')[1];
      //update the form
      setTab(formType);
      $('.private-form,.competition-form,.public-form').removeClass('selected');
      $("."+formType+"-form").addClass('selected');
      //update the submissions
      $('.private-submissions,.competition-submissions,.public-submissions').removeClass('selected');
      console.log($("."+formType+"-submissions"));
      $("."+formType+"-submissions").addClass('selected');
    }
  })
  $(`.${getTab()}`).click();
})

function setTab(tabName){
  window.localStorage.setItem('tabName',tabName);
}

function getTab(){
  res = window.localStorage.getItem('tabName')
  if(res == null){
    return 'private'
  }
  else{
    return res
  }
}


function getUrl(path){
  window.location.href = path;
}

function fetchSubmissions(props){
  // console.log(`fetching ${props.type} submissions...`);
  $.ajax({
    url:props.url,
    type:'POST',
    success:function(data){
      if(data.success){
        $(`.${props.type}-submissions .submission-container`).empty()
        console.log(data.submissions);
        Object.keys(data.submissions).sort().reverse().map((gameID)=>{
          d = new Date(parseInt(gameID));
          var hours = d.getHours() % 12;
              hours = hours ? hours : 12;
          var date = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(d.getMonth())] + " " +
          ("00" + d.getDate()).slice(-2) + " " +
          d.getFullYear() + " " +
          ("00" + hours).slice(-2) + ":" +
          ("00" + d.getMinutes()).slice(-2) + ":" +
          ("00" + d.getSeconds()).slice(-2) + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM');
          $(`.${props.container} .submission-container`).append(`
            <div class='submission-block' id='submission-${gameID}'>
              <p class='submission-title'> Submission ID:
                <span class='sub-id'>${gameID}</span>
              </p>
              <p class='submission-date'> Submission Date:
                <span class='sub-date'>${date}</span>
              </p>
              <p class='submission-status'> Submission Status:
                <span class='sub-status'>${data.submissions[gameID].status}</span>
              </p>
            </div>`);
      });
        if(props.type == 'competition'){
                  console.log(data);
        }

      }
    },
    cache:false
  })
}

function handleErrors(errors){
  errorKeys = Object.keys(errors);
  errorKeys.forEach(function(cur){
    console.log("#"+cur+" .errorMessage");
    if(errors[cur]){
      $("#"+cur+" .errorMessage").text(errors[cur]).removeClass("inactive");
    }
  });
}

$(window).ready(function(){
  private = {
    type:'private',
    url:'/submissions/private',
    container:'private-submissions'
  }
  public = {
    type:'public',
    url:'/submissions/public',
    container:'public-submissions'
  }
  competition = {
    type:'competition',
    url:'/submissions/competition',
    container:'competition-submissions'
  }

  window.setTimeout(function(){
    fetchSubmissions(private);
    window.setInterval(function(){
      fetchSubmissions(private);
    },3000)
  },0)

  window.setTimeout(function(){
    fetchSubmissions(public);
    window.setInterval(function(){
        fetchSubmissions(public);
    },3000)
  },400)

  window.setTimeout(function(){
    fetchSubmissions(competition);
    window.setInterval(function(){
        fetchSubmissions(competition);
    },3000)
  },800)

});
