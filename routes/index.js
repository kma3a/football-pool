var express = require('express');
var passport = require('passport');
var router = express.Router();
var theGame = require('../config/game');
var loserGame = require('../config/loserGame');
var Game = require('../models/index.js').Game;
var Pick = require('../models/index.js').Pick;
var playingTeams = require('../config/getPlayingTeams');
var checks = require('../config/checks');


router.get('/',function(req, res, next) {
  var user = req.user || null;
  var picks = [];
  if (user) {
    Game.findAll({where: {inProgress: true}}).then(function(games) {
      var gameList = [];
    games.forEach(function(game) {
      if(!game.loserGame) {theGame.set(game)}
      if(game.loserGame) {loserGame.set(game)}
      gameList.push({GameId: game.id});
    });
    if (gameList.length > 0) {
      user.getPicks({where: {$or: gameList, $and: {active: true} }}).then(function(pick) {
        picks = pick || [];
        var output = { title: 'Football Pools', user: user, teams: playingTeams.getRetrievedGameData().data, thisWeekPicks: theGame.picksForThisWeek(picks), picksInCurrent: theGame.picksInCurrentGame(picks), currentGame: theGame.get(), currentBuyIn: theGame.buyIn(picks) , picksInLoser: loserGame.picksInCurrentGame(picks), loserBuyIn: loserGame.buyIn(picks), loserPicksThisWeek: loserGame.picksForThisWeek(picks), pickHistory: theGame.pickHistory(picks, games)};

        res.render('index', output);
        }, function (err) {
          console.log("ERROR IN / ",err); 
          picks = [];
        res.render('index', { title: 'Football Pools', user: user, teams: playingTeams.getRetrievedGameData().data, thisWeekPicks: theGame.picksForThisWeek(picks), picksInCurrent: theGame.picksInCurrentGame(picks), currentGame: theGame.get(), currentBuyIn: theGame.buyIn(picks) , picksInLoser: loserGame.picksInCurrentGame(picks), loserBuyIn: loserGame.buyIn(picks), loserPicksThisWeek: loserGame.picksForThisWeek(picks), pickHistory: theGame.pickHistory(picks, games)});

        });
      } else {
      picks = [];
        res.render('index', { title: 'Football Pools', user: user, teams: playingTeams.getRetrievedGameData().data, picks: picks, picksInCurrent: theGame.picksInCurrentGame(picks), currentGame: theGame.get(), currentBuyIn: theGame.buyIn(picks) , picksInLoser: loserGame.picksInCurrentGame(picks), loserBuyIn: loserGame.buyIn(picks), pickHistory: theGame.pickHistory(picks, games)});
      }
    }, function (err){console.log("I screwed up", err);})
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
    // typically we might sanity check that user_id is of the right format
  User.find({where: {username: username}}).then(function(user) {
    if (!user) return next("Error user not found");
    req.user = user;
    next()
  }, function (err) {next(err)});
});




module.exports = router;
