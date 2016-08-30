var Pick = require('../models/index.js').Pick;
var currentGame= require("../config/game");
var currentLoserGame = require("../config/loserGame");
var playingTeams = require("../config/getPlayingTeams");

function weeklyPickUpdate() {
  var date = new Date();
  date.setDate(date.getDate() - 7 )
  playingTeams.getFirstWeeks(2016)
    .then(playingTeams.getGamesOnDate.bind(null, date, true, true))
    .then(updateWeek)
    .then(playingTeams.getGamesOnDate.bind(null, new Date(), true))
    .then(changeGameData);
}


function changeGameData(games){
  var game = currentGame.get();
  var loserGame = currentLoserGame.get();

  console.log('I am the games', games.data);

  game.update({weekGames: games.data, weekNumber:game.weekNumber, canEdit:true });
  if(loserGame) {
    loserGame.update({weekGames: games.data, weekNumber: loserGame.weekNumber, canEdit:true});
  }
}

// this function will update the information for the week.
function updateWeek(winningTeams) {
  var game = currentGame.get();
  var loserGame = currentLoserGame.get();
  Pick.findAll({where: {GameId: game.id, week: game.weekNumber}})
    .then(function(gamePicks) {
        updatePicks(gamePicks)
    });
  
  if(loserGame) {
    Pick.findAll({where: {GameId: loserGame.id, week: loserGame.weekNumber}})
      .then( function(gamePicks) {
        updatePicks(gamePicks)
      });
  }

  function updatePicks(gamePicks){
    gamePicks.forEach(function(pick){
     if(winningTeams.data.indexOf(pick.teamChoice) >=0) {
       pick.update({hasWon: true});
      }
    })
  }
  return Promise.resolve();
}

function start() {
  return currentGame.init()
    .then(currentLoserGame.init)
    .then(weeklyPickUpdate);
}

module.exports = {
  start: start
};
