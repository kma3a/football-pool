var express = require('express');
var router = express.Router();
var User = require('../models/index.js').User;
var mail = require('../config/nodeMailer');

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

router.post('/:user/:admin', isAdmin, function(req,res,next) {
  var admin = req.params.admin,
      changedUser = req.params.user,
      changedUserEmail;
  console.log("req". admin);
  User.find({where: {username: changedUser}})
    .then(
      function (currentUser) { 
        if (currentUser) {
          changedUserEmail = currentUser.email
          currentUser.update({admin: admin}).then(sendAndRedirect, error);
        } else { error("I AM LOST");}
      }, 
      error
  );

  function sendAndRedirect(user) {
    if(admin === 'true') {
      mail.sendAdminEmail(changedUser, changedUserEmail);
    }
    res.redirect('/admin');
  }

  function error(err) {console.loc("I HAD A BOOBOO", err), res.redirect('/admin');}


});

function isAdmin(req, res, next) {
  if (req.session.isLoggedIn && req.user.admin){
    return next();
  } else {
    res.redirect('/login');
  }

}



module.exports = router;
