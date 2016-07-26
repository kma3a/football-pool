var express = require('express');
var router = express.Router();
var Game = require('../models/index.js').Game;

router.get('/', isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('game', { title: 'start a new game', user: user});
});


router.post('/', isLoggedIn, function(req, res, next) {
  var user = req.user;
  Game.create({inProgress: true, weekNumber: 1, totalIn: 0, loserGame: false})
    .then(success, error);
  function success() {
    res.redirect('/admin');
  }

  function failure() {
    res.redirect('/game');
  }
  
});


module.exports = router;
