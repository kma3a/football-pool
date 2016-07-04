var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.post('/login', passport.authenticate('login', {
  successRedirect: '/user',
  faulureRedirect: '/login',
  failureFlash: true
}));

module.exports = router;
