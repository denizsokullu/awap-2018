// /public/teamID/outputs/
// /public/teamID/uploads/

// /tournament/teamID/submission.py
// /tournament/games/

// take in an submission Object

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function remove(array, element) {
    return array.filter(e => e !== element);
}

function logBase(base,val) {
  return Math.log(val) / Math.log(base);
}

const gamePath = '';

class Team{
    constructor(teamName,teamID,filePath){
      this.teamName = teamName;
      this.filePath = filePath;
      this.scoreHistory = {};
    }
    getFile(callback){
      //get the file here
    }
}

class Tournament{
  constructor(teams,gameSize){
    //teams is an array of team objects;
    this.teams = teams;
    this.teamsLeft = teams;
    this.allBrackets = {};
    this.currentBrackets = {};
    this.gameSize = gameSize;
    //so every tournament much start with 4 * 2^n
    // 4,8,16,32,64,128
  }
  runTournament(){

  }

  createBrackets(){
    let brackets = {};
    //create a copy for the teamsLeft to place them.
    let teamsToPlace = this.teamsLeft.slice(0);
    let backupTeams = [];
    //Edge case when there aren't enough players.
    if((this.teamsLeft / this.gameSize) < 1){
      console.log("Tried creating brackets with less players than min people...")
      return brackets;
    }
    const numMatches = Math.pow(this.gameSize,Math.ceil(logBase(this.gameSize,this.teamsLeft.length))-1);
    let matches = [];
    for(var i = 0; i < numMatches; i++){
      matches.push({players:{}})
    }
    for(var i = 0; i < numMatches; i++){
      for(var player = 1; player <= this.gameSize; player++){
          // pick a random player from the backup pool.
          if(teamsToPlace.length == 0){
            let teamIndex = getRandomInt(backupTeams.length);
            // console.log("Picked team " +teamIndex+ " as backup...");
            matches[i].players[player] = {backup:true,team:backupTeams[teamIndex]};
          }
          // pick a random player, and remove him from the selection pool,
          // place them onto backups.
          else{
            let teamIndex = getRandomInt(teamsToPlace.length);
            // console.log("Picked team " +teamIndex+ "...");
            let team = teamsToPlace[teamIndex];
            teamsToPlace = remove(teamsToPlace,team);
            backupTeams.push(team);
            matches[i].players[player] = {backup:false,team:team};
          }
        }
    }
    this.currentBrackets = matches;
  }
  evaluateBrackets(){
    let nextRoundTeams = []
    for(var i = 0; i < this.currentBrackets.length;i++){
      let currentGame = this.currentBrackets[i];
      //check if all backup
      let allStatus = Object.keys(currentGame.players).map((index)=>{
        return currentGame.players[index].backup
      })
      if(allStatus.includes(false)){
        //evaluate here
        let winner = currentGame.players[parseInt(getRandomInt(this.gameSize)+1)];
        //advance the player to next round if not backup
        if(!winner.backup){
          // console.log(winner.team,currentGame);
          nextRoundTeams.push(winner.team);
        }
      }
    }
    this.teamsLeft = nextRoundTeams;
    console.log(this.teamsLeft);
  }
}

tournament = new Tournament([...Array(30).keys()],4);
tournament.createBrackets();
tournament.evaluateBrackets();
tournament.createBrackets();
tournament.evaluateBrackets();
// console.log(tournament.currentBrackets);
