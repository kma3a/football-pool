var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var User = require('../models/index.js').User;

router.get('/', function(req, res, next) {
  var user = req.user || null;
  res.render('index', { title: 'Football Pools', user: user});
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  faulureRedirect: '/login',
  failureFlash: true
  })
);

router.get('/signup', function(req, res, next) {
  res.render('register', { title: 'Sign up' });
});

router.post('/signup',passport.authenticate('local-signup',{
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

router.get('/user/:username', isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('profile', { title: user.username + "'s Profile", user: user});
});

router.get('/user/:username/edit', isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('editProfile', { title: 'Edit ' + user.username + "'s Profile", user: user});
});

//still working on this route it is currently broken
router.post('/user/:username/update', isLoggedIn, function(req, res, next) {
  var user = req.user;
  console.log("I am in someting", user);
  if(!validPassword(res.old_password, User.password)) {
    console.log("not valid password");
    res.render('editProfile', { title: 'Edit ' + user.username + "'s Profile", user: user});
  }

  if(!checkPassword(res.new_password, res.new_password_confirm)) {
    console.log("not valid passwords");
    res.render('editProfile', { title: 'Edit ' + user.username + "'s Profile", user: user});
  }

  if(!validateEmail(res.email)) {
    console.log("not valid email");
    res.render('editProfile', { title: 'Edit ' + user.username + "'s Profile", user: user});
  }

  var currentUser = User.findOne({where: {username:user.username }});
  currentUser.update({email: res.email, password: generateHash(res.password)});
    
  user.save(function(err) {
    if (err) return next(err)
    console.log("Before relogin: "+req.session.passport.user.changedField)
    req.login(user, function(err) {
      if (err) return next(err)
      console.log("After relogin: "+req.session.passport.user.changedField)
      res.send(200)
    })
  })
  res.render('editProfile', { title: 'Edit ' + currentUser.username + "'s Profile", user: user});

  /*

  console.log("not valid other");
  res.render('profile', { title: user.username + "'s Profile", user: user});
  */

});

//also not working but committing for now
router.get('/admin/:username',function(req, res, next) {
  var user = req.user;
  User.findAll().then(function(userlist) {
    if(userlist) {
      res.render('admin', {user: user, userlist: userlist});
    } else {
      res.redirect("/user/"+ user.username);
    }
  }, function(err) {console.log("I errored", err)});
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



function checkPassword(password, password_confirm) {
  return password === password_confirm;
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}


function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
function validPassword(password, userPassword) {
  return bcrypt.compareSync(password, userPassword);
};


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
