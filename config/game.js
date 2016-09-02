var Game = require('../models/index.js').Game;
var currentGame = null;

function set(game) {
  currentGame = game;
}

function get() {
  return currentGame;
}

function init() {
  console.log("I am in int");
  return Game.findOne({where: {inProgress: true, loserGame: false}})
    .then(function(game) { 
      console.log("I am the gamge", game);
      set(game); 
      return Promise.resolve(game)
    });

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
  console.log("I am going to set the count");
 if(!theGame) { return []}
 if (theGame.weekNumber === 1) {
   theGame.getPicks({where: {week: theGame.weekNumber, active: true}})
     .then(function(picksList) {
       console.log("picksList", picksList);
       var users = [];
       picksList.forEach(function(pick) {
         if (users.indexOf(pick.UserId) === -1) {
           users.push(pick.UserId)
         }
       });
       console.log("USERS", users);
        
        theGame.update({totalIn: users.length});
     }, function(err) {console.log("There were no picks");} )
  } else {
  console.log("I have more tha one week");
   theGame.getPicks({where: {$or: [{week: game.weekNumber}, {week:game.weekNumber-1}], active: true}})
     .then(function(picksList) {
       console.log("picksList", picksList);
       var users = [];
       picksList.forEach(function(pick) {
         if (pick.week === game.weekNumber -1 && !pick.hasWon) {
           return;
         }
         if (users.indexOf(pick.UserId) === -1) {
           users.push(pick.UserId)
         }
       });
       console.log("USERS", users);
        
       theGame.update({totalIn: users.length});

      }, function(err) {console.log("There were no picks");})
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

function picksForThisWeek(picks) {
  if (!currentGame ) {return {};}
  picks = picks || [];
  var inPicks = [];
  for (i=0; i < picks.length; i++) {
    var pick = picks[i];
    if(pick.GameId === currentGame.id && pick.week === currentGame.weekNumber) {
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
  setUserCount: setUserCount,
  picksForThisWeek: picksForThisWeek
}
