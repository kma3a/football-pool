var Game = require('../models/index.js').Game;
var currentGame = null;

function set(game) {
  console.log("I am in setgame");
  currentGame = game;
}

function get() {
  return currentGame;
}

function init() {
  return Game.findOne({where: {inProgress: true, loserGame: false}}).then(function(game) { set(game); Promise.resolve(game)});

}

function buyIn(picks) {
  if(!currentGame || !isBuyInWeek()) {return []}

  picks = picks || [];
  var inPicks = [];
  for (i=0; i < picks.length; i++) {
    var pick = picks[i];
    if(pick.GameId === currentGame.id && !pick.hasWon && pick.week + 1 === currentGame.weekNumber) {
      inPicks.push(pick);
    }
  }
  return inPicks

}

function isBuyInWeek(){
  var buyInWeeks = [2,3];
  return buyInWeeks.indexOf(currentGame.weekNumber) > -1;
}

function setUserCount(theGame){
  console.log("I am in set user count", theGame);
 if(!theGame) { return []}
 if (theGame.weekNumber === 1) {
   theGame.getPicks({where: {week: theGame.weekNumber, active: true}})
     .then(function(picksList) {
       var users = [];
       console.log("I am the picksList", picksList)
       picksList.forEach(function(pick) {
         if (users.indexOf(pick.UserId) === -1) {
           users.push(pick.UserId)
         }
       });
        
      console.log("I am the totalIn", users.length);
        theGame.update({totalIn: users.length});
     })
  } else {

  }

}
 

function picksInCurrentGame(picks) {
  if (!currentGame ) {return {};}
  picks = picks || [];
  var inPicks = [];
  for (i=0; i < picks.length; i++) {
    var pick = picks[i];
    if(pick.GameId === currentGame.id && pick.hasWon && pick.week + 1 === currentGame.weekNumber) {
      inPicks.push(pick);
    }
  }
  return inPicks
}

module.exports = {
  init: init,
  set: set,
  get: get,
  buyIn: buyIn,
  picksInCurrentGame: picksInCurrentGame,
  setUserCount: setUserCount
}
