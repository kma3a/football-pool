var express = require('express');
var router = express.Router();
var CONSTANT = require('../config/constant');
var Game = require('../models/index.js').Game;
var Pick = require('../models/index.js').Pick;

/* GET users listing. */
router.get('/new', function(req, res, next) {
  var user = req.user;
  res.render('picks', {user: user, teams: CONSTANT.teams});
});

router.post('/new', function(req, res, next) {
  var user = req.user;
  Game.findOne({where: {inProgress: true, loserGame: false}})
    .then();
});


module.exports = router;
