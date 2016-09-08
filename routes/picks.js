'use strict';

var express = require('express');
var router = express.Router();
var Game = require('../models/index.js').Game;
var Pick = require('../models/index.js').Pick;
var checks = require('../config/checks');
var playingTeams = require('../config/getPlayingTeams');
var theGame = require('../config/game');

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
    Pick.create({week: game.weekNumber, teamChoice: req.body.teamPick})
    .then(function(pick) {
      if(pick) {
        pick.setUser(user);
        pick.setGame(game);
        pick.save();
        theGame.setUserCount(game);
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
      Pick.create({teamChoice:  req.body.teamPick, week: currentPick.week+1, hasPaid: currentPick.hasWon ? currentPick.hasPaid : false, GameId: currentPick.GameId, UserId: currentPick.UserId})
        .then( function(newPick) {
          if(!currentPick.hasWon){
            Game.findOne({where: {id: currentPick.GameId}})
              .then(function(game) {
                theGame.setUserCount(game);
              })
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

router.get('/:pickId/edit', checks.isLoggedIn, function(req, res, next) {
  var pick = req.params.pickId;
  var user = req.user;
  Pick.findOne({where: {id: pick}}).then(
    function(currentPick) {
      res.render('picksEdit', {title: "Edit your pick", user: user, teams: playingTeams.getTeams(), pick: currentPick});
    }, failure);

 function failure(err) {
    res.redirect("/");
  };


});

//I know not right route but didn't seem like put worked...
router.post('/:pickId/update', checks.isLoggedIn, function(req, res, next) {
  var pick = req.params.pickId;
  var user = req.user;
  Pick.update({teamChoice:  req.body.teamPick},{where:{id: pick}})
    .then(success, failure);

  function success(pick) {
    res.redirect("/");
  }

 function failure(err) {
    res.redirect("/");
  };


});


router.delete("/:pickId", checks.isLoggedIn, function(req, res, next) {
  var pickId = req.params.pickId;
  console.log("pickid", pickId);
  return Pick.findOne({where: {id: pickId}})
    .then(function(pick) { 
      console.log("pick", pick);
      Game.findOne({where:{id: pick.GameId}})
        .then(function (game) {
          console.log("I am the game", game);
          theGame.setUserCount(game);
        });
      pick.destroy();
      return res.json(pick);
    }, function (err){console.log(err); return Primise.reject("I failed");});
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
