var express = require('express');
var passport = require('passport');
var router = express.Router();
var CONSTANT = require('../config/constant');
var Game = require('../models/index.js').Game;

router.get('/', function(req, res, next) {
  var user = req.user || null;
  var picks = null;
  var currentGame =  null;;
  if (user) {
    user.getPicks().then(function(pick) { 
      console.log("I am pick", pick);
      picks = pick || [];
      console.log("I am ght picks", picks);
      Game.findOne({where: {inProgress: true, loserGame: false}}).then(function(game) { 
        if(game) {currentGame = game;}
        res.render('index', { title: 'Football Pools', user: user, teams: CONSTANT.teams, picks: picks, currentGame: currentGame});
      });
    });
  } else {
    res.render('index', { title: 'Football Pools', user: user, teams: CONSTANT.teams, picks: picks, currentGame: currentGame});
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


function isLoggedIn(req, res, next) {
  if (req.session.isLoggedIn){
    return next();
  } else {
    res.redirect('/login');
  }
}

module.exports = router;
