var Pick = require('../models/index.js').Pick;
var currentGame= require("../config/game");
var currentLoserGame = require("../config/loserGame");
var mail = require('../config/nodeMailer');
var User = require('../models/index.js').User;
var pickUsers = [];
  
function setChoice() {
  var game = currentGame.get();
  var loserGame = currentLoserGame.get();
  var currentPick = (game && game.weekGames) ? game.weekGames[game.weekGames.length -1].awayTeam : null;
  if(!currentPick && loserGame && loserGame.weekGames) {
    currentPick = loserGame.weekGames[loserGame.weekGames.length-1];
  }
  if(game){
    game.update({canEdit: false});
    return Pick.findAll({where: {GameId: game.id, week: game.weekNumber-1, hasWon:true, active: true}})
      .then(function(gamePicks) {
        console.log("we have the picks", gamePicks);
        if (gamePicks.length>0){
          console.log("we have the picks");
          return updatePicks(gamePicks, currentPick);
        }
        return Promise.resolve();
      })
      .then(checkLosers)
      .then(sendEmails);
  } else {
    return checkLosers()
            .then(sendEmails);
  }
}


function checkLosers() {
  console.log("I am in checkLosers");
  var loserGame = currentLoserGame.get();
  if(loserGame) {
    loserGame.update({canEdit: false});
    return Pick.findAll({where: {GameId: loserGame.id, week: loserGame.weekNumber -1, hasWon:true, active: true}})
      .then( function(gamePicks) {
        if (gamePicks.length>0){
          return updatePicks(gamePicks, currentPick)

        }
        return Promise.resolve();
      });
  }
  return Promise.resolve();
}

function updatePicks(gamePicks, newChoice){
  console.log("entering update picks");
  var deffered = new Promise(function(resolve, reject) {
    gamePicks.forEach(function(pick){
      //return User.findOne({where:{id: pick.UserId}})
        //.then(function(user){
          console.log("I am in update picks");
//          Pick.create({week: pick.week+1, hasPaid: pick.hasPaid, teamChoice: newChoice,GameId: pick.GameId, UserId:pick.UserId});
          //pick.update({active: false});
          //if (pickUsers.indexOf(user.email) === -1) {
            //pickUsers.push(user.email);
          //}
        //});
    });

    console.log("gonna return the resolve");
    return resolve();

  });
}

function sendEmails() {

  var message = {
    subject: "Pick Chosen!",
    text: "Good Morning! It is Saturday and we have gone through to make sure picks were chosen. If you got this email then your pick was not inputed and we chose for you. Hope you have a great weekend!",
  };

  console.log("I am thing", pickUsers);
  message.to = pickUsers;
  mail.sendEveryoneEmail(message);
}


function start() {
  currentGame.init()
    .then(currentLoserGame.init)
    .then(setChoice);
}

module.exports = {
  start: start
};

