var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/index.js').User;

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({where: {id:id}})
      .then(function(user) {
        done(null, user);
      }, function(err) {
        done(err, false);
      }
    );
  });

  passport.use('local-signup', new LocalStrategy({
    passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
      var params = req.body;
      process.nextTick(function() {
        User.findOne({where: {id:1}}).then(firstUser, error);
      })
      
      function firstUser(user) {
        if (user) {
          User.findOne({where: { username :  username }})
            .then(continueOn, error);
        } else {
          User.create({username: username, password: password, email: params.email, admin: true})
            .then(finalUser, error);
        }
      }

      function continueOn(user) {
        if(user) {
          return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
        } else if (!checkPassword(password, params.password_confirm)){
          return done(null, false, req.flash('signupMessage', 'Passwords do not match please try again'));
        } else if(!validateEmail(params.email)) {
          return done(null, false, req.flash('signupMessage', 'Please enter a valid email'));
        } else {
          User.create({username: username, password: password, email: params.email, admin: false})
            .then(finalUser, error)
        }
      }

      function finalUser(user) {
        if (user) {
          req.session.username = user.username;
          req.session.isLoggedIn = true;
          return done(null, user)
        } else {
          return done(null, false, req.flash("signupMessage", "There was an error creating your user"));
        }
      }

      function error(err) {
        console.log("I HAVE FAILED YOU", err);
        return done(err, false, req.flash('signupMessage', 'Please enter a valid email'));
      }

    }
  ))

  passport.use('local-login', new LocalStrategy({
    passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
      process.nextTick(function() {
        User.findOne({where: { username :  username }})
          .then(checkUser, error);
      })

      function checkUser(user) {
        if (!user || !user.validPassword(password)) {
          return done(null, false, req.flash("loginMessage", "username and/or password doesn't exhist"));
        } else {
          req.session.username = user.username;
          req.session.isLoggedIn = true;
          return done(null, user)
        }
      }

      function error(err) {
        console.log("I HAVE FAILED YOU", err);
      }

    }
  ))

  function checkPassword(password, password_confirm) {
    return password === password_confirm;
  }

  function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

}


