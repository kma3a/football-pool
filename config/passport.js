var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/index.js').User;

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
      console.log("ARGS", arguments);
      process.nextTick(function() {
        User.findOne({where: { email :  email }})
          .then(function(user) {
            if (user) {
              return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
              var newUser            = User.create({
                                        email: email,
                                        password: generateHash(password),
                                      });
              newUser.save(function(err) {
                if (err)
                  throw err;
                return done(null, newUser);
              });
            }
          }, function(err){ return err;})
        
      })
  }))

  
  function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  function validPassword(password) {
    return bcrypt.compareSync(password, this.local.password);
  };

}


