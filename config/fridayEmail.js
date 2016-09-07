var currentGame= require("../config/game");
var currentLoserGame = require("../config/loserGame");
var Picks = require('../models/index.js').Pick;
var mail = require('../config/nodeMailer');
var User = require('../models/index.js').User;

function fridayEmail() {
  console.log("I got to fridayEmail");
  var current = currentGame.get();
  if ((current && current.weekNumber === 1)) {
      console.log("first week");
    firstWeek();
  } else {
    if(current){
      console.log("I am in current");
      getWeekPicks(current.weekNumber, current.id)
        .then(getLosers)
        .then(getEmails);
    } else {
      getLosers([])
        .then(getEmails);
    }
  }
}

function getLosers(users) {
  var loser = currentLoserGame.get()
  var current = currentGame.get();
    console.log("I am in loser");
  if(loser && loser.weekNumber === 1){
    getLostPicks(current.id)
      .then(function(picks) {
        if (users.length >0) {
          return Promise.resolve(filter(users.concat(picks)));
        }
        return Promise.resolve(picks);
      }, function() { return Promise.resolve(users);});
  }else if (loser) {
    console.log("I am in loser");
    getCurrentPicks(loser.weekNumber, loser.id)
      .then(function(picks) {
        if (users.length >0) {
          return Promise.resolve(filter(users.concat(picks)));
        }
        return Promise.resolve(picks);
      }, function() { return Promise.resolve(users);});
  }
  return Promise.resolve(users);
}

function getItem(array, item){
  var newArray = array.map(function(user) {
    return user[item];
  });

  return newArray;
}

function filter(array) {
  return array.filter(function(el, index, array) {
    console.log(array.indexOf(el) == index);
    return array.indexOf(el) == index;
  })

}

function getWeekPicks(week, gameId){
  var info = {attributes: ['UserId'], where: {GameId: gameId, $and: {week: week-1, hasWon: true}}};

  return getPicks(info);
}

function getLostPicks(gameId){
  var info = {attributes: ['UserId'], where: {GameId: gameId, $and: { hasWon: false}}};

  return getPicks(info);
}

function getPicks(info) {
  return Picks.findAll(info)
    .then(function(picksList) {
        var users = getItem(picksList, 'UserId');
        return Promise.resolve(filter(users));

    }, function() {Promise.resolve([]);});

}


function getEmails(userList) {
  console.log("I am the users", userList);
  User.findAll({attributes: ['email'], where: { id: {$in: userList}}}).then(function(emails) {
    if(emails && emails.length > 0) {
      var emailList = getItem(emails, 'email');
      console.log("I am the users", emailList);
      sendEmails(emailList);
    } else {
      console.log("there are no emails");
    }
  }, function(err) {
      console.log("I errored", err);
  });
}

function firstWeek() {
  User.findAll({attributes: ['email']}).then(function(emailList) {
    if(emailList && emailList.length > 0) {
      var allEmails = emailList.map(function (user) {
        return user.email});
      sendEmails(allEmails);
    } else {
      console.log("there are no emails");
    }
  }, function(err) {
      console.log("I errored", err);
  });
}

function sendEmails(AllEmails,game) {

  var message = {
    subject: "Hurry and lock your picks!",
    text: "Hey it is currently Friday and you have not made your pick for this week",
  };

    message.to = allEmails;
    mail.sendEveryoneEmail(message);
}

function start() {
  currentGame.init()
    .then(currentLoserGame.init)
    .then(fridayEmail);
}

module.exports = {
  start: start
};
