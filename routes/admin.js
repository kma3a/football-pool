var express = require('express');
var router = express.Router();
var User = require('../models/index.js').User;
var Game = require('../models/index.js').Game;
var mail = require('../config/nodeMailer');

//also not working but committing for now
router.get('/', isAdmin, function(req, res, next) {
  var user = req.user;
  var games = null;
  Game.findAll({where: {inProgress: true}}).then( function(gameslist) { games = gameslist;});
  User.all().then(function(userlist) {
    console.log("game", games);
    if(userlist && userlist.length > 0) {
      res.render('admin', { user: user, userlist: userlist, game: games, hasGame: games === [] ? false : true});
    } else {
      res.redirect("/");
    }
  }, function(err) {
      console.log("I errored", err);
      res.redirect("/");
  });
});

router.post('/:user/:admin', isAdmin, function(req,res,next) {
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

router.get('/email', isAdmin, function(req, res, next) {
  var user = req.user;
  res.render('email', { user: user});
});

router.post('/email', isAdmin, function(req, res, next) {
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

function isAdmin(req, res, next) {
  if (req.session.isLoggedIn && req.user.admin){
    return next();
  } else {
    res.redirect('/login');
  }

}



module.exports = router;
