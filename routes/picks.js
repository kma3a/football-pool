'use strict';

var express = require('express');
var router = express.Router();
var CONSTANT = require('../config/constant');
var Game = require('../models/index.js').Game;
var Pick = require('../models/index.js').Pick;
var checks = require('../config/checks');
var playingTeams = require('../config/getPlayingTeams');

/* GET users listing. */
router.get('/new', checks.isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('newPicks', {title: "choose your starting team", user: user, teams: playingTeams.getTeams()});
});

router.post('/new',checks.isLoggedIn, function(req, res, next) {
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
          game.update({totalIn: game.totalIn+1 })
            .then(function(updatedGame) {console.log("game", updatedGame)});
        }
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

router.get('/:pickId', checks.isLoggedIn, function(req, res, next) {
  var pick = req.params.pickId;
  var user = req.user;
  Pick.findOne({where: {id: pick}}).then(
    function(currentPick) {
      res.render('picks', {title: "choose Next Weeks Team", user: user, teams: playingTeams.getTeams(), pick: currentPick});
    }, failure);

 function failure(err) {
    res.redirect("/");
  };


});

router.post('/:pickId', checks.isLoggedIn, function(req, res, next) {
  var user = req.user;
  var pick = req.params.pickId;
  Pick.findOne({where: {id: pick}}).then(
    function(currentPick) {
      Pick.create({teamChoice:  req.body.teamPick, active: true, hasWon: false, week: currentPick.week+1, hasPaid: currentPick.hasWon ? currentPick.hasPaid : false, GameId: currentPick.GameId, UserId: currentPick.UserId})
        .then( function(newPick) {
          if(!currentPick.hasWon){
            Game.findOne({where: {id: currentPick.GameId}})
              .then(function(game) {game.update({totalIn: game.totalIn + 1})});
          }

          currentPick.update({
            active: false
          });
          res.redirect("/");
      } ,failure);
    }, failure);



  function failure(err) {
    res.redirect("/picks/"+ pick);
  };

});


router.post('/:pickId/paid', checks.isAdmin, function(req,res,next) {
  var pickId = req.params.pickId;
  Pick.findOne({where: {id: pickId}})
    .then(
      function (currentPick) { 
        if (currentPick) {
          currentPick.update({hasPaid: true}).then(redirect, error);
        } else { error("I AM LOST");}
      }, 
      error
  );

  function redirect(user) {
    res.redirect('/admin');
  }

  function error(err) {console.log("I HAD A BOOBOO", err), res.redirect('/admin');}


});


module.exports = router;
