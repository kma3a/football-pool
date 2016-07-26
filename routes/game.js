var express = require('express');
var router = express.Router();
var Game = require('../models/index.js').Game;

router.post('/', isAdmin, function(req, res, next) {
  var user = req.user;
  Game.create({inProgress: true, weekNumber: 1, totalIn: 0, loserGame: false})
    .then(success, error);
  function success() {
    console.log("I did it!");
    res.redirect('/admin');
  }

  function error(err) {
    console.log("I errored", err);
    res.redirect('/admin');
  }
  
});


function isAdmin(req, res, next) {
  if (req.session.isLoggedIn && req.user.admin){
    return next();
  } else {
    res.redirect('/login');
  }

}

module.exports = router;
