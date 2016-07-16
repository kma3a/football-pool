var express = require('express');
var router = express.Router();
var User = require('../models/index.js').User;

//also not working but committing for now
router.get('/', isAdmin, function(req, res, next) {
  var user = req.user;
  User.all().then(function(userlist) {
    if(userlist && userlist.length > 0) {
      res.render('admin', { user: user, userlist: userlist});
    } else {
      res.redirect("/");
    }
  }, function(err) {
      console.log("I errored", err);
      res.redirect("/");
  });
});

function isAdmin(req, res, next) {
  if (req.session.isLoggedIn && req.user.admin){
    return next();
  } else {
    res.redirect('/login');
  }

}



module.exports = router;
