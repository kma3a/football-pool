var express = require('express');
var router = express.Router();
var CONSTANT = require('../config/constant');
var Game = require('../models/index.js').Game;
var Pick = require('../models/index.js').Pick;

/* GET users listing. */
router.get('/new', isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('newPicks', {user: user, teams: CONSTANT.teams});
});

router.post('/new',isLoggedIn, function(req, res, next) {
  var user = req.user;
  Game.findOne({where: {inProgress: true, loserGame: false }})
    .then(success, failure);
  function success(game) {
    Pick.create({active: true, hasWon: false, week: game.weekNumber, hasPaid: false, teamChoice: req.body.teamPick})
    .then(function(pick) {
      if(pick) {
        pick.setUser(user);
        pick.setGame(game);
        pick.save();
        if(game.weekNumber === 1){
          game.update({totalIn: game.totalIn++ })
            .then(function(updatedGame) {console.log("game", updatedGame)});
        }
        console.log("pick", pick);
        res.redirect('/')
      } else {
        failure("I failed");
      }
    }, failure);;
  }
  function failure(err) {
    res.redirect("/picks/new");
  };
});

function isLoggedIn(req, res, next) {
  if (req.session.isLoggedIn){
    return next();
  } else {
    res.redirect('/login');
  }
}


module.exports = router;
