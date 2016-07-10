var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/index.js').User;

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    console.log("serialize yser", user);
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    console.log("deserialize yser", id);
    User.findOne({where: {id:id}})
      .then(function(user) {
        done(null, user);
      }, function(err) {
        done(err, false);
      }
    );
  });

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
      process.nextTick(function() {
        User.findOne({where: { email :  email }})
          .then(continueOn, error);
      })

      function continueOn(user) {
        console.log("done",done)
        if(user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }else{
          User.create({email: email, password: generateHash(password)})
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


  
  function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  function validPassword(password) {
    return bcrypt.compareSync(password, this.local.password);
  };

}


