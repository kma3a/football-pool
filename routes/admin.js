var express = require('express');
var router = express.Router();
var User = require('../models/index.js').User;
var Game = require('../models/index.js').Game;
var Pick = require('../models/index.js').Pick;
var mail = require('../config/nodeMailer');
var checks = require('../config/checks');

//also not working but committing for now
router.get('/', checks.isAdmin, function(req, res, next) {
  var user = req.user;
  var games = null;
  var gamesList = []
  var picksList = null;
  Game.findAll({where: {inProgress: true}}).then( function(gameslist) { games = gameslist; games.forEach(function(game) {
    gamesList.push({gameID: game.id});
  });})
  Pick.findAll({where: {$or: gamesList, $and: {active: true}}}).then(
    function(currentPicks) {
      console.log("I am picks", picksList);
      picksList = currentPicks;

      User.all().then(function(userlist) {
        if(userlist && userlist.length > 0) {
          var hasGames = games.length > 0;
          userlist.forEach(function(currentUser) {
            console.log("picksList", picksList);
            currentUser.picks = getPicks(currentUser.id, picksList);
          })
          
          console.log("userpicks", userlist[0].picks);
          res.render('admin', { user: user, userlist: userlist, game: games, hasGame: hasGames });
        } else {
          res.redirect("/");
        }
      }, function(err) {
          console.log("I errored", err);
          res.redirect("/");
      });

    });

});

function getPicks(userId, picksList) {
  return picksList.filter(function(obj) {
    return obj.UserId === userId;
  });

}


router.post('/:user/:admin', checks.isAdmin, function(req,res,next) {
  var admin = req.params.admin,
      changedUser = req.params.user,
      changedUserEmail;
  console.log("req". admin);
  User.find({where: {username: changedUser}})
    .then(
      function (currentUser) { 
        if (currentUser) {
          changedUserEmail = currentUser.email
          currentUser.update({admin: admin}).then(sendAndRedirect, error);
        } else { error("I AM LOST");}
      }, 
      error
  );

  function sendAndRedirect(user) {
    if(admin === 'true') {
      mail.sendAdminEmail(changedUser, changedUserEmail);
    }
    res.redirect('/admin');
  }

  function error(err) {console.loc("I HAD A BOOBOO", err), res.redirect('/admin');}


});

router.get('/email', checks.isAdmin, function(req, res, next) {
  var user = req.user;
  res.render('email', { user: user});
});

router.post('/email', checks.isAdmin, function(req, res, next) {
  var message = {};
      message.text = req.body.text;
      message.subject = req.body.subject;
  User.findAll({attributes: ['email']}).then(function(emailList) {
    if(emailList && emailList.length > 0) {
      var allEmails = emailList.map(function (user) {
        return user.email});
      message.to = allEmails;
      mail.sendEveryoneEmail(message)
    } else {
      res.redirect("/admin");
    }
  }, function(err) {
      console.log("I errored", err);
      res.redirect("/admin/email");
  });
});

module.exports = router;
