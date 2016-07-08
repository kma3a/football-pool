var express = require('express');
var passport = require('passport');
var router = express.Router();
var model = require('../models/index.js');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/login', passport.authenticate('login', {
  successRedirect: '/user',
  faulureRedirect: '/login',
  failureFlash: true
  })
);

router.get('/signup', function(req, res, next) {
  res.render('register', { title: 'Sign up' });
});

router.post('/signup',function(req, res) {
    model.User.create({
      username: 'John',
      email: 'Hancock',
      password: "stuff",
      admin: false
    });
});



module.exports = router;
