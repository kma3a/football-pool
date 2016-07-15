var express = require('express');
var router = express.Router();
var User = require('../models/index.js').User;
var mail = require('../config/nodeMailer');

router.get('/:username', isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('profile', { title: user.username + "'s Profile", user: user});
});

router.get('/:username/edit', isLoggedIn, function(req, res, next) {
  var user = req.user;
  res.render('editProfile', { title: 'Edit ' + user.username + "'s Profile", user: user});
});


router.post('/:username/update', isLoggedIn, function(req, res, next) {
  var user = req.user;
  var params = req.body;

  if(!user.validPassword(params.old_password)) {
    res.redirect('/user/'+user.username+'/edit');
  }

  if(!checkPassword(params.new_password, params.new_password_confirm)) {
    res.redirect('/user/'+user.username+'/edit');
  }

  if(!validateEmail(params.email)) {
    res.redirect('/user/'+user.username+'/edit');
  }

  user.update({email: params.email, password: params.new_password}, {where: {username: user.username}}). then(function(currentUser) {
    console.log("CURRENT", currentUser);
    mail.sendUpdateEmail(currentUser.email);
    res.redirect('/user/'+user.username);
    
  }, function (err) {
    res.redirect('/user/'+user.username+'/edit');
  })

});




//TODO make this part of it's own module so we can use it more easily in other areas or part of the user module
function checkPassword(password, password_confirm) {
  return password === password_confirm;
}

//TODO make this part of the user model
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function isLoggedIn(req, res, next) {
  if (req.session.isLoggedIn){
    return next();
  } else {
    res.redirect('/login');
  }
}



module.exports = router;
