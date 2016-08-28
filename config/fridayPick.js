var Pick = require('../models/index.js').Pick;
var currentGame= require("../config/game");
var currentLoserGame = require("../config/loserGame");

  
function setChoice() {
  var game = currentGame.get();
  var loserGame = currentLoserGame.get();
  var currentPick = (game && game.weekGames) ? game.weekGames[game.weekGames.length -1].awayTeam : null;
  if(!currentPick && loserGame && loserGame.weekGames) {
    currentPick = loserGame.weekGames[loserGame.weekGames.length-1];
  }
  if(game){
    game.update({canEdit: false});
    Pick.findAll({where: {GameId: game.id, week: game.weekNumber-1, hasWon:true, active: true}})
      .then(function(gamePicks) {
        if (gamePicks.length>0){
          updatePicks(gamePicks, currentPick);
        }
      });
  }
  
  if(loserGame) {
    loserGame.update({canEdit: false});
    Pick.findAll({where: {GameId: loserGame.id, week: loserGame.weekNumber -1, hasWon:true, active: true}})
      .then( function(gamePicks) {
        if (gamePicks.length>0){
          updatePicks(gamePicks, currentPick);
        }
      });
  }
}

function updatePicks(gamePicks, newChoice){
  gamePicks.forEach(function(pick){
    Pick.create({week: pick.week+1, hasPaid: pick.hasPaid, teamChoice: newChoice,GameId: pick.GameId, UserId:pick.UserId});
    pick.update({active: false});
  })
}

currentGame.init()
  .then(currentLoserGame.init)
  .then(setChoice);

