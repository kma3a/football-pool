var Pick = require('../models/index.js').Pick;
var currentGame= require("../config/game");
var currentLoserGame = require("../config/loserGame");
var playingTeams = require("../config/getPlayingTeams");
var mail = require('../config/nodeMailer');
var User = require('../models/index.js').User;
var winnerList = [];
var loserList = [];


function weeklyPickUpdate() {
  var date = new Date();
  date.setDate(date.getDate() - 11 )
  playingTeams.getFirstWeeks(2016)
    .then(playingTeams.getGamesOnDate.bind(null, date, true, true))
    .then(updateWeek)
    .then(playingTeams.getGamesOnDate.bind(null, new Date(), true))
    .then(changeGameData)
    .then(emailPeople);
}


function changeGameData(games){
  console.log("I am in changeGamedata", games);
  var game = currentGame.get();
  var loserGame = currentLoserGame.get();

  game.update({weekGames: games.data, weekNumber:game.weekNumber + 1, canEdit:true });
  currentGame.setUserCount(game);
  if(loserGame) {
    loserGame.update({weekGames: games.data, weekNumber: loserGame.weekNumber, canEdit:true});
    currentGame.setUserCount(loserGame);
  }
  return Promise.resolve();
}

// this function will update the information for the week.
function updateWeek(winningTeams) {
  console.log("I am updateing the week");
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
    console.log('I am updating the picks');
    gamePicks.forEach(function(pick){
      User.findOne({attributes: ['email'], where: {id: pick.UserId}}).then(function(user) {
        user = user.email;

       if(winningTeams.data.indexOf(pick.teamChoice) >=0) {
         pick.update({hasWon: true});
         if (winnerList.indexOf(user) ===-1) {
          winnerList.push(user);
         }

        } else {
         if (loserList.indexOf(user) ===-1) {
          loserList.push(user);
         }
        }
     });

    })
  }
  return Promise.resolve();
}

function emailPeople() {
  console.log("I am in emailPeople");
  loserList.filter(function(user) {
    return winnerList.indexOf(user) === -1;
  });
  console.log("I am the winners", winnerList);
  mail.emailWinners(winnerList);
  console.log("I am the losers", loserList);
  mail.emailLosers(loserList);
}
  

function start() {
  console.log("I am in week Winners");
  return currentGame.init()
    .then(currentLoserGame.init)
    .then(weeklyPickUpdate);
}

module.exports = {
  start: start
};
