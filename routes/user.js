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
  var email = user.email;
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
  var updatedUser = {
    email: params.email
  }
  console.log("new_Password", params.new_password);
  if(params.new_password) { updatedUser.password = params.new_password;};

  console.log("updated user", updatedUser);

  user.update(updatedUser, {where: {username: user.username}}). then(function(currentUser) {
    var emails = [user.email];
    if(email !== params.email) {emails.push(email)}
    mail.sendUpdateEmail(emails);
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
