var express = require('express');
var passport = require('passport');
var router = express.Router();
var User = require('../models/index.js').User;

router.get('/', function(req, res, next) {
  var user = req.user || null;
  res.render('index', { title: 'Football Pools', user: user});
});

router.get('/login', function(req, res, next) {
  var message = req.flash().loginMessage;
  res.render('login', { title: 'Login', loginMessage: message || null });
});

router.post('/login', passport.authenticate('local-login',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
  })
);

router.get('/signup', function(req, res, next) {
  var message = req.flash().signupMessage;
  res.render('register', { title: 'Sign up', signupMessage: message ||null });
});

router.post('/signup', passport.authenticate('local-signup',{
    successRedirect:'/',
    failureRedirect:'/signup',
    failureFlash: true
  })
);

router.get('/logout', function(req, res) {
  req.logout();
  req.session.username = null;
  req.session.isLoggedIn = false;
  res.redirect('/');
});

//also not working but committing for now
router.get('/admin/:username',function(req, res, next) {
  var user = req.user;
  User.all().then(function(userlist) {
    if(userlist && userlist.length > 0) {
      res.render('admin', { user: user, userlist: userlist});
    } else {
      res.redirect("/user/"+ user.username);
    }
  }, function(err) {
      console.log("I errored", err);
      res.redirect("/user/"+ user.username);
  });
});



router.param('username', function(req, res, next, username) {
  console.log(">>>>>>> I HAVE USERNAME", username);
    // typically we might sanity check that user_id is of the right format
  User.find({where: {username: username}}).then(function(user) {
    if (!user) return next("Error user not found");
    req.user = user;
    next()
  }, function (err) {next(err)});
});


function isLoggedIn(req, res, next) {
  if (req.session.isLoggedIn){
    return next();
  } else {
    res.redirect('/login');
  }
}


function isAdmin(req, res, next) {
  console.log("I AM THE USER", req.user);
  if (req.isAuthenticated() && req.user.admin){
    return next();
  } else {
    res.redirect('/login');
  }

}



module.exports = router;
