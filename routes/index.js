var express = require('express');
var passport = require('passport');
var router = express.Router();
var CONSTANT = require('../config/constant');
var theGame = require('../config/game');
var loserGame = require('../config/loserGame');
var Game = require('../models/index.js').Game;
var Pick = require('../models/index.js').Pick;
var playingTeams = require('../config/getPlayingTeams');
var checks = require('../config/checks');


router.get('/',function(req, res, next) {
  var user = req.user || null;
  var picks = null;
  if (user) {
    Game.findAll({where: {inProgress: true}}).then(function(games) { 
      var gameList = [];
    games.forEach(function(game) {
      if(!game.loserGame) {theGame.set(game)}
      if(game.loserGame) {loserGame.set(game)}
      gameList.push({gameId: game.id});
    });
    console.log("GAME", gameList);
    if (gameList.length > 0) {
      user.getPicks({where: {$or: gameList, $and: {active: true} }}).then(function(pick) { 
        picks = pick || [];

        res.render('index', { title: 'Football Pools', user: user, teams: playingTeams.getRetrievedGameData().data, picks: picks, picksInCurrent: theGame.picksInCurrentGame(picks), currentGame: theGame.get(), currentBuyIn: theGame.buyIn(picks) , picksInLoser: loserGame.picksInCurrentGame(picks), loserBuyIn: loserGame.buyIn(picks)});
        });
      } else {
      picks = [];
        res.render('index', { title: 'Football Pools', user: user, teams: playingTeams.getRetrievedGameData().data, picks: picks, picksInCurrent: theGame.picksInCurrentGame(picks), currentGame: theGame.get(), currentBuyIn: theGame.buyIn(picks) , picksInLoser: loserGame.picksInCurrentGame(picks), loserBuyIn: loserGame.buyIn(picks)});
      }
    })
  } else {
    res.render('index', { title: 'Football Pools', user: user, teams: playingTeams.getRetrievedGameData().data, picks: picks, picksInCurrent: theGame.picksInCurrentGame()});
  }
});

router.get('/login', function(req, res, next) {
  var message = req.flash().loginMessage;
  res.render('login', { title: 'Login', loginMessage: message || null });
});

router.post('/login', passport.authenticate('local-login',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
  })
);

router.get('/signup', function(req, res, next) {
  var message = req.flash().signupMessage;
  res.render('register', { title: 'Sign up', signupMessage: message ||null });
});

router.post('/signup', passport.authenticate('local-signup',{
    successRedirect:'/',
    failureRedirect:'/signup',
    failureFlash: true
  })
);

router.get('/logout', function(req, res) {
  req.logout();
  req.session.username = null;
  req.session.isLoggedIn = false;
  res.redirect('/');
});

router.param('username', function(req, res, next, username) {
  console.log(">>>>>>> I HAVE USERNAME", username);
    // typically we might sanity check that user_id is of the right format
  User.find({where: {username: username}}).then(function(user) {
    if (!user) return next("Error user not found");
    req.user = user;
    next()
  }, function (err) {next(err)});
});




module.exports = router;
