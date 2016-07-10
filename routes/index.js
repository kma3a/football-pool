var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Football Pools'});
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/user',
  faulureRedirect: '/login',
  failureFlash: true
  })
);

router.get('/signup', function(req, res, next) {
  res.render('register', { title: 'Sign up' });
});

router.post('/signup',passport.authenticate('local-signup',{
    successRedirect:'/user',
    failureRedirect:'/signup',
    failureFlash: true
  })
);

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/user', isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('index', { title: 'Welcome', user: user });
});

router.get('/profile', isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('profile', { title: user.username + "'s Profile", user: user});
});

router.get('/profile/edit', isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('editProfile', { title: 'Edit ' + user.username + "'s Profile", user: user});
});





function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
}

module.exports = router;
