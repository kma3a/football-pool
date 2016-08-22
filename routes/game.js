var express = require('express');
var router = express.Router();
var Game = require('../models/index.js').Game;
var checks = require('../config/checks');
var playingTeams = require('../config/getPlayingTeams');

router.post('/', checks.isAdmin, function(req, res, next) {
  var user = req.user;
  Game.create()
    .then(success, error);
  function success(game) {
    var date = new Date();
    playingTeams.getFirstWeeks(2016)
      .then(playingTeams.getGamesOnDate.bind(null, date, true))
      .then(function(games) {
        game.update({weekGames: games.data});
        console.log("I did it! game");
        res.redirect('/admin');
    });
  }

  function error(err) {
    console.log("I errored game", err);
    res.redirect('/admin');
  }
  
});


module.exports = router;
