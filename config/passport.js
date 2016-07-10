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
      process.nextTick(function() {
        User.findOne({where: { username :  username }})
          .then(continueOn, error);
      })

      function continueOn(user) {
        var params = req.body;
        if(user) {
          return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
        } else if (!checkPassword(password, params.password_confirm)){
          return done(null, false, req.flash('signupMessage', 'Passwords do not match please try again'));
        } else if(!validateEmail(params.email)) {
          return done(null, false, req.flash('signupMessage', 'Please enter a valid email'));
        } else {
          User.create({username: username, password: generateHash(password), email: params.email, admin: checkAdmin()})
            .then(finalUser, error)
        }
      }

      function finalUser(user) {
        if (user) {
          return done(null, user)
        } else {
          return done(null, false, req.flash("signupMessage", "There was an error creating your user"));
        }
      }

      function error(err) {
        console.log("I HAVE FAILED YOU", err);
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
        var userPassword = user.password;
        if (!user || !validPassword(password, userPassword)) {
          return done(null, false, req.flash("loginMessage", "username and/or password doesn't exhist"));
        } else {
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

  function checkAdmin() {
    var user = User.find({where: {id: 1}});
    return user.username;
  }

  function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  function validPassword(password, userPassword) {
    return bcrypt.compareSync(password, userPassword);
  };

}


