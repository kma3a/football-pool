var express = require('express');
var passport = require('passport');
var router = express.Router();
var User = require('../models/user.js');

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
  User.register(new User({ username : req.body.username, email: req.body.email, password: req.body.password}, function(err, account) {
    if (err) {
      return res.render("register", {info: "Sorry. That username already exists. Try again."});
    }
 
    passport.authenticate('local')(req, res, function () {
      res.redirect('/user');
    });
  }));
});



module.exports = router;
